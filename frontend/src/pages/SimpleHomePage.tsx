import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  hero: {
    background: 'linear-gradient(to right, #1976d2, #3f51b5)',
    color: 'white',
    padding: '5rem 1rem',
    textAlign: 'center' as const,
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.25rem',
    maxWidth: '800px',
    margin: '0 auto 2rem auto',
  },
  button: {
    backgroundColor: 'white',
    color: '#1976d2',
    padding: '0.75rem 2rem',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    fontSize: '1.125rem',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  heroImage: {
    marginTop: '3rem',
    maxWidth: '1000px',
    margin: '3rem auto 0 auto',
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  image: {
    width: '100%',
    borderRadius: '0.25rem',
  },
  section: {
    padding: '5rem 1rem',
  },
  featuresSection: {
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '4rem',
    color: '#333',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
  },
  featureIcon: {
    color: '#1976d2',
    marginBottom: '1rem',
    width: '3rem',
    height: '3rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#333',
  },
  featureText: {
    color: '#666',
  },
  stepsContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3rem',
    height: '3rem',
    backgroundColor: '#1976d2',
    color: 'white',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  stepContent: {
    marginLeft: '1rem',
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.25rem',
  },
  stepText: {
    color: '#666',
  },
  footer: {
    backgroundColor: '#333',
    color: 'white',
    padding: '2rem',
    textAlign: 'center' as const,
  },
};

const SimpleHomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>Real-Time Collaborative Whiteboard</h1>
          <p style={styles.subtitle}>
            Create, collaborate, and share ideas in real-time with our powerful whiteboard application.
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard" style={styles.button}>
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/register" style={styles.button}>
              Get Started
            </Link>
          )}

          {/* Hero Image */}
          <div style={styles.heroImage}>
            <div style={styles.imageContainer}>
              <img
                src="https://images.unsplash.com/photo-1542626991-cbc4e32524cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80"
                alt="Collaborative Whiteboard"
                style={styles.image}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{...styles.section, ...styles.featuresSection}}>
        <h2 style={styles.sectionTitle}>Powerful Features</h2>
        
        <div style={styles.featuresGrid}>
          {/* Feature 1 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Interactive Canvas</h3>
            <p style={styles.featureText}>
              Draw, add shapes, text, and more with our intuitive canvas tools. Express your ideas visually with ease.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Real-Time Collaboration</h3>
            <p style={styles.featureText}>
              Work together with your team in real-time. See changes instantly as they happen with live cursor tracking.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Secure Sharing</h3>
            <p style={styles.featureText}>
              Control who can view and edit your whiteboards with fine-grained permissions and secure authentication.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>High Performance</h3>
            <p style={styles.featureText}>
              Built with modern technologies for smooth, responsive performance even with complex drawings and multiple users.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        
        <div style={styles.stepsContainer}>
          {/* Step 1 */}
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>Create an Account</h3>
              <p style={styles.stepText}>Sign up for free and get access to all features.</p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>Create a Whiteboard</h3>
              <p style={styles.stepText}>Start a new whiteboard project with just a few clicks.</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>Invite Collaborators</h3>
              <p style={styles.stepText}>Share your whiteboard with team members to collaborate in real-time.</p>
            </div>
          </div>
          
          {/* Step 4 */}
          <div style={styles.step}>
            <div style={styles.stepNumber}>4</div>
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>Draw and Create Together</h3>
              <p style={styles.stepText}>Use our powerful tools to bring your ideas to life collaboratively.</p>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" style={{...styles.button, backgroundColor: '#1976d2', color: 'white'}}>
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/login" style={{...styles.button, backgroundColor: '#1976d2', color: 'white'}}>
              Login Now
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Collaborative Whiteboard App. All rights reserved.</p>
      </div>
    </div>
  );
};

export default SimpleHomePage;
