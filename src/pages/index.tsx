import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <img 
          src="/img/treasurehunter.png" 
          alt="Treasure Hunt" 
          style={{maxWidth: '200px', height: 'auto'}}
        />
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <div className="container" style={{padding: '2rem 0', textAlign: 'center'}}>
          <div className={styles.buttons} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem'}}>
            <Link
              className="button button--lg"
              to="/docs/treasurehunter/create-treasure-hunt"
              style={{backgroundColor: 'steelblue', color: 'white', border: 'none'}}>
              Create Treasure Hunt 🏗️
            </Link>
            <Link
              className="button button--lg"
              to="/qr-scanner"
              style={{backgroundColor: 'steelblue', color: 'white', border: 'none'}}>
              Perform Treasure Hunt 🔍
            </Link>
          </div>
        </div>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
