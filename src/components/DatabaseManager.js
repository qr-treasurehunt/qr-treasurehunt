// Utility function to safely convert Uint8Array to base64
function uint8ToBase64(uint8) {
  let CHUNK_SIZE = 0x8000; // 32k
  let index = 0;
  let length = uint8.length;
  let result = '';
  let slice;
  while (index < length) {
    slice = uint8.subarray(index, Math.min(index + CHUNK_SIZE, length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

// Save the database to localStorage
export const saveDatabaseToLocalStorage = (db) => {
  const binaryArray = db.export(); // Export the database as a binary array
  const base64 = uint8ToBase64(new Uint8Array(binaryArray)); // Use chunked conversion
  localStorage.setItem('sqlite-db', base64); // Store the base64 string in localStorage
  console.log('Database saved to localStorage');
};

// Helper to dynamically load sql-wasm.js from static files
export function loadSqlJsScript(src) {
  return new Promise((resolve, reject) => {
    if (window.initSqlJs) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Load image for a specific step from database
export const loadImageForStep = (step, database, setCurrentImage) => {
  console.log(`Loading image for step ${step}`);
  if (database) {
    try {
      const stmt = database.prepare('SELECT bilde_base64 FROM steg WHERE qrkode IS ?');
      stmt.bind([step === null ? null : step.toString()]);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        console.log(`Found image for step ${step}:`, row.bilde_base64 ? 'Image data exists' : 'No image data');
        console.log('Image data length:', row.bilde_base64 ? row.bilde_base64.length : 0);
        console.log('Image data starts with:', row.bilde_base64 ? row.bilde_base64.substring(0, 50) : 'N/A');
        if (setCurrentImage) {
          setCurrentImage(row.bilde_base64);
        }
        return row.bilde_base64;
      } else {
        console.log(`No image found for step ${step}`);
        if (setCurrentImage) {
          setCurrentImage(null);
        }
        return null;
      }
      stmt.free();
    } catch (e) {
      console.error('Error loading image:', e);
      if (setCurrentImage) {
        setCurrentImage('ERROR');
      }
      return 'ERROR';
    }
  } else {
    console.log('Database not available for loading image');
    // Retry after a short delay if database is not ready
    setTimeout(() => {
      if (database) {
        console.log('Retrying image load with available database');
        loadImageForStep(step, database, setCurrentImage);
      }
    }, 100);
    return null;
  }
};

// Initialize treasure sequence from database
export const initializeTreasureSequence = (database, setTreasureSequence, setCurrentImage, loadImageCallback) => {
  try {
    console.log('Initializing treasure sequence...');
    
    // Check if order_index column exists, if not add it
    try {
      database.run('ALTER TABLE steg ADD COLUMN order_index INTEGER');
      console.log('Added order_index column to existing table');
    } catch (e) {
      // Column likely already exists, or we're creating a new table
      console.log('order_index column handling:', e.message);
    }
    
    // Check if we need to initialize order_index values
    const checkStmt = database.prepare('SELECT COUNT(*) as count FROM steg WHERE order_index IS NULL');
    checkStmt.step();
    const nullCount = checkStmt.getAsObject().count;
    checkStmt.free();
    
    if (nullCount > 0) {
      console.log('Initializing order_index for existing records');
      // Get all records ordered by their QR code number
      const initStmt = database.prepare('SELECT qrkode FROM steg ORDER BY CAST(qrkode AS INTEGER)');
      const qrcodes = [];
      while (initStmt.step()) {
        qrcodes.push(initStmt.getAsObject().qrkode);
      }
      initStmt.free();
      
      // Assign order_index values
      qrcodes.forEach((qrkode, index) => {
        const updateStmt = database.prepare('UPDATE steg SET order_index = ? WHERE qrkode = ?');
        updateStmt.bind([index, qrkode]);
        updateStmt.step();
        updateStmt.free();
      });
      
      // Save the updated database
      saveDatabaseToLocalStorage(database);
    }
    
    // Now get the sequence in order_index order
    // QR codes with values come first (hunt locations), then NULL (final treasure)
    const stmt = database.prepare('SELECT qrkode FROM steg ORDER BY COALESCE(order_index, 999999), CASE WHEN qrkode IS NULL THEN 1 ELSE 0 END');
    const sequence = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      sequence.push(row.qrkode);
    }
    stmt.free();
    
    console.log('Found treasure sequence:', sequence);
    setTreasureSequence(sequence);
    
    // Load the first image (step 1) using the passed database
    // For the first location, use the first QR code (not NULL)
    if (sequence.length > 0) {
      const firstQRCode = sequence.find(qr => qr !== null);
      if (firstQRCode) {
        console.log('Loading first image for QR code:', firstQRCode);
        loadImageCallback(firstQRCode, database);
      } else {
        console.log('No QR codes found, only final treasure');
        setCurrentImage('NO_DATA');
      }
    } else {
      console.log('No treasures found in database');
      setCurrentImage('NO_DATA'); // Special flag to indicate no data
    }
  } catch (e) {
    console.error('Error initializing sequence:', e);
    setCurrentImage('ERROR'); // Special flag to indicate error
  }
};

// Initialize database
export const initializeDatabase = async (setDb, setCurrentImage, setTreasureSequence, loadImageCallback) => {
  try {
    console.log('Loading database...');
    const config = { locateFile: () => "/sql/sql-wasm.wasm" };
    await loadSqlJsScript("/sql/sql-wasm.js");
    const SQL = await window.initSqlJs(config);
    const savedDb = localStorage.getItem('sqlite-db');
    let newDb;
    if (savedDb) {
      console.log('Found saved database in localStorage');
      const binaryArray = new Uint8Array(atob(savedDb).split('').map(char => char.charCodeAt(0)));
      newDb = new SQL.Database(binaryArray);
    } else {
      console.log('No saved database found, creating new one');
      newDb = new SQL.Database();
      newDb.run(`CREATE TABLE IF NOT EXISTS steg (qrkode TEXT PRIMARY KEY, bilde_base64 TEXT, order_index INTEGER);`);
    }
    setDb(newDb);
    
    // Initialize the treasure hunt sequence
    initializeTreasureSequence(newDb, setTreasureSequence, setCurrentImage, loadImageCallback);
  } catch (error) {
    console.error('Error loading database:', error);
    setCurrentImage('ERROR');
  }
};

// Fetch and display the database content
export const updateDatabaseContent = (db, setDatabaseContent, setNextQRNumber) => {
  const rows = db.exec("SELECT * FROM steg ORDER BY COALESCE(order_index, 999999), CASE WHEN qrkode IS NULL THEN 1 ELSE 0 END");
  const content = rows[0] ? rows[0].values : []; // Ensure there's a result before accessing values
  setDatabaseContent(content);
  
  // Update next QR number
  if (content.length === 0) {
    setNextQRNumber(1);
  } else {
    const numbers = content.map(([qrkode]) => parseInt(qrkode)).filter(n => !isNaN(n));
    setNextQRNumber(numbers.length > 0 ? Math.max(...numbers) + 1 : 1);
  }
};

// Shuffle array function for random hunt mode
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get current sequence based on mode
export const getCurrentSequence = (huntMode, shuffledSequence, treasureSequence) => {
  return huntMode === 'random' ? shuffledSequence : treasureSequence;
};

// Get expected QR code for current step
export const getExpectedQRCode = (huntMode, shuffledSequence, treasureSequence, currentStep) => {
  const sequence = getCurrentSequence(huntMode, shuffledSequence, treasureSequence);
  if (sequence.length === 0 || currentStep > sequence.length) return null;
  return sequence[currentStep - 1];
};

// Handle QR code scanning logic
export const handleQRCodeScanned = (
  code, 
  currentStep, 
  huntMode, 
  shuffledSequence, 
  treasureSequence, 
  scannedCodes, 
  db,
  setters // object containing all setters: { setLastScannedCode, setScannedCodes, setCurrentStep, setGameComplete, setCurrentImage }
) => {
  const { setLastScannedCode, setScannedCodes, setCurrentStep, setGameComplete, setCurrentImage } = setters;
  const sequence = getCurrentSequence(huntMode, shuffledSequence, treasureSequence);
  
  // Get all hunt QR codes (excluding the final treasure location which is NULL)
  const huntQRCodes = sequence.filter(qr => qr !== null);
  
  // Check if this QR code is part of our treasure hunt
  const isValidHuntQRCode = huntQRCodes.includes(code);
  const isAlreadyScanned = scannedCodes.includes(code);
  
  // For sequential mode, check if this is the expected QR code
  if (huntMode === 'sequential') {
    const expectedCode = getExpectedQRCode(huntMode, shuffledSequence, treasureSequence, currentStep);
    
    if (code === expectedCode) {
      // Correct QR code in sequence
      setScannedCodes(prev => [...prev, code]);
      
      if (currentStep === huntQRCodes.length) {
        // All hunt QR codes have been scanned - show the final treasure!
        // The final treasure is the NULL entry in the sequence
        loadImageForStep(null, db, setCurrentImage);
        setCurrentStep(sequence.length); // Set to final step number
        setGameComplete(true);
        setLastScannedCode(`${code} found! All locations found! Here's your treasure! 🎉`);
      } else {
        // Move to next step
        const nextStep = currentStep + 1;
        const nextCode = huntQRCodes[nextStep - 1];
        loadImageForStep(nextCode, db, setCurrentImage);
        setCurrentStep(nextStep);
        setLastScannedCode(`${code} found! Now find location ${nextStep} (QR ${nextCode})`);
      }
    } else if (isAlreadyScanned) {
      // Already scanned this code
      setLastScannedCode(`Already found: QR ${code} was already scanned`);
    } else if (isValidHuntQRCode) {
      // Valid QR code but out of sequence
      setLastScannedCode(`Out of sequence: You scanned QR ${code}, but please find QR ${expectedCode} first (step ${currentStep})`);
    } else if (treasureSequence.includes(code)) {
      // They scanned a QR code from the treasure hunt but not part of hunt locations
      setLastScannedCode(`This QR code is part of the treasure hunt but not a location to find`);
    } else {
      // Not a valid QR code for this hunt
      setLastScannedCode(`Not part of this hunt: This QR code doesn't belong to your treasure hunt`);
    }
  } else {
    // Random mode - any order is acceptable
    if (isValidHuntQRCode && !isAlreadyScanned) {
      // Valid QR code that hasn't been scanned yet
      setScannedCodes(prev => [...prev, code]);
      
      // Find remaining unscanned QR codes
      const remainingCodes = huntQRCodes.filter(qr => !scannedCodes.includes(qr) && qr !== code);
      
      if (remainingCodes.length === 0) {
        // All hunt QR codes have been scanned - show the final treasure!
        // The final treasure is the NULL entry in the sequence
        loadImageForStep(null, db, setCurrentImage);
        setCurrentStep(sequence.length); // Set to final step number
        setGameComplete(true);
        setLastScannedCode(`${code} found! All locations found! Here's your treasure! 🎉`);
      } else {
        // Still have codes to find - show the next location to find
        const nextCodeToFind = remainingCodes[0]; // Pick the first remaining code
        loadImageForStep(nextCodeToFind, db, setCurrentImage);
        setCurrentStep(scannedCodes.length + 1); // Update step count
        
        if (remainingCodes.length === 1) {
          setLastScannedCode(`${code} found! Find the last location (QR ${nextCodeToFind})`);
        } else {
          setLastScannedCode(`${code} found! Find any of the ${remainingCodes.length} remaining locations`);
        }
      }
    } else if (isAlreadyScanned) {
      // Already scanned this code
      setLastScannedCode(`Already found: QR ${code} was already scanned`);
    } else if (treasureSequence.includes(code)) {
      // They scanned a QR code from the treasure hunt but not part of current hunt locations
      setLastScannedCode(`This QR code is part of the treasure hunt but not a location to find`);
    } else {
      // Not a valid QR code for this hunt
      setLastScannedCode(`Not part of this hunt: This QR code doesn't belong to your treasure hunt`);
    }
  }
};

// Start the game with selected mode
export const startGame = (
  huntMode,
  treasureSequence,
  db,
  setters // object containing: { setGameStarted, setCurrentStep, setScannedCodes, setLastScannedCode, setGameComplete, setShuffledSequence, setCurrentImage }
) => {
  const { setGameStarted, setCurrentStep, setScannedCodes, setLastScannedCode, setGameComplete, setShuffledSequence, setCurrentImage } = setters;
  
  if (treasureSequence.length === 0) return;
  
  setGameStarted(true);
  setCurrentStep(1);
  setScannedCodes([]);
  setLastScannedCode('');
  setGameComplete(false);

  if (huntMode === 'random') {
    // Create shuffled sequence (excluding the final treasure location which is NULL)
    const huntLocations = treasureSequence.filter(qr => qr !== null);
    const shuffled = shuffleArray(huntLocations);
    // Add NULL at the end to represent final treasure
    const finalSequence = [...shuffled, null];
    setShuffledSequence(finalSequence);
    
    // Load first image from shuffled sequence
    loadImageForStep(shuffled[0], db, setCurrentImage);
  } else {
    // Sequential mode - use original sequence (already has NULL at end)
    setShuffledSequence(treasureSequence);
    const firstQRCode = treasureSequence.find(qr => qr !== null);
    if (firstQRCode) {
      loadImageForStep(firstQRCode, db, setCurrentImage);
    }
  }
};

// Delete a specific item from the database
export const deleteFromDatabase = (db, qrkode, setMessage, setDatabaseContent, setNextQRNumber) => {
  try {
    // Delete the item with the specified QR code
    if (qrkode === null) {
      const stmt = db.prepare('DELETE FROM steg WHERE qrkode IS NULL');
      stmt.step();
      stmt.free();
    } else {
      const stmt = db.prepare('DELETE FROM steg WHERE qrkode = ?');
      stmt.bind([qrkode]);
      stmt.step();
      stmt.free();
    }
    
    // Re-index all items to ensure proper ordering
    const allItems = db.exec("SELECT qrkode FROM steg ORDER BY COALESCE(order_index, 999999), CASE WHEN qrkode IS NULL THEN 1 ELSE 0 END");
    if (allItems[0] && allItems[0].values) {
      allItems[0].values.forEach(([itemQrkode], index) => {
        if (itemQrkode === null) {
          const stmt = db.prepare('UPDATE steg SET order_index = ? WHERE qrkode IS NULL');
          stmt.bind([index]);
          stmt.step();
          stmt.free();
        } else {
          const stmt = db.prepare('UPDATE steg SET order_index = ? WHERE qrkode = ?');
          stmt.bind([index, itemQrkode]);
          stmt.step();
          stmt.free();
        }
      });
    }
    
    // Save the updated database
    saveDatabaseToLocalStorage(db);
    
    // Update the displayed content
    updateDatabaseContent(db, setDatabaseContent, setNextQRNumber);
    
    setMessage(`Item with QR code ${qrkode === null ? '(Final Treasure)' : qrkode} has been deleted.`);
  } catch (error) {
    console.error('Error deleting from database:', error);
    setMessage('Error deleting item from database.');
  }
};

// Reorder database items by moving entire records (QR codes with their images)
export const reorderDatabaseItems = (db, fromIndex, toIndex, databaseContent, setMessage, setDatabaseContent, setNextQRNumber) => {
  try {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= databaseContent.length || toIndex >= databaseContent.length) {
      return;
    }

    // Check if trying to move the final treasure (NULL qrkode)
    const movedQRCode = databaseContent[fromIndex][0];
    const targetQRCode = databaseContent[toIndex][0];
    
    if (movedQRCode === null || targetQRCode === null) {
      setMessage('Cannot reorder the final treasure location. It must remain last.');
      return;
    }

    // Create a copy of the current data array and reorder it
    const items = [...databaseContent];
    
    // Remove the item from its current position and insert it at the new position
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    
    // Update order_index for all items
    items.forEach(([qrkode], index) => {
      if (qrkode === null) {
        // Handle NULL qrkode with IS NULL
        const stmt = db.prepare('UPDATE steg SET order_index = ? WHERE qrkode IS NULL');
        stmt.bind([index]);
        stmt.step();
        stmt.free();
      } else {
        // Handle regular qrkode
        const stmt = db.prepare('UPDATE steg SET order_index = ? WHERE qrkode = ?');
        stmt.bind([index, qrkode]);
        stmt.step();
        stmt.free();
      }
    });
    
    // Save the updated database
    saveDatabaseToLocalStorage(db);
    
    // Update the displayed content
    updateDatabaseContent(db, setDatabaseContent, setNextQRNumber);
    
    const direction = fromIndex < toIndex ? 'down' : 'up';
    setMessage(`Moved item with QR code ${movedItem[0]} ${direction} to position ${toIndex + 1}`);
  } catch (error) {
    console.error('Error reordering database items:', error);
    setMessage('Error reordering items in database.');
  }
};
