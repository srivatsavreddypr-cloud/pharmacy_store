import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Prevent scrolling on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 20% 30%, #1a4b5e 0%, #0a2f3a 50%, #041a20 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Floating Particles */}
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              background: `rgba(14, 165, 233, ${Math.random() * 0.3 + 0.1})`,
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 15 + 8}s linear infinite`,
              animationDelay: Math.random() * 10 + 's',
              filter: 'blur(1px)',
            }}
          />
        ))}
        
        {/* Animated Gradients */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 30% 40%, rgba(14, 165, 233, 0.2) 0%, transparent 60%)',
          animation: 'rotate 40s linear infinite',
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 70% 60%, rgba(102, 126, 234, 0.2) 0%, transparent 60%)',
          animation: 'rotateReverse 35s linear infinite',
        }} />
        
        {/* Additional decorative elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
        }} />
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        transform: `perspective(1200px) rotateX(${mousePosition.y * 0.03}deg) rotateY(${mousePosition.x * 0.03}deg)`,
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: '64px',
          boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          padding: '50px 70px',
          width: '700px',
          maxWidth: '85vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}>
          {/* Animated Border */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #0ea5e9, #667eea, #0ea5e9, transparent)',
            animation: 'slide 3s linear infinite',
          }} />
          
          {/* Corner Decorations */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 60,
            height: 60,
            borderTop: '2px solid rgba(14, 165, 233, 0.3)',
            borderLeft: '2px solid rgba(14, 165, 233, 0.3)',
            borderRadius: '16px 0 0 0',
          }} />
          <div style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 60,
            height: 60,
            borderTop: '2px solid rgba(14, 165, 233, 0.3)',
            borderRight: '2px solid rgba(14, 165, 233, 0.3)',
            borderRadius: '0 16px 0 0',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            width: 60,
            height: 60,
            borderBottom: '2px solid rgba(14, 165, 233, 0.3)',
            borderLeft: '2px solid rgba(14, 165, 233, 0.3)',
            borderRadius: '0 0 0 16px',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderBottom: '2px solid rgba(14, 165, 233, 0.3)',
            borderRight: '2px solid rgba(14, 165, 233, 0.3)',
            borderRadius: '0 0 16px 0',
          }} />
          
          {/* Decorative Logo Icons */}
          <div style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '24px',
            animation: 'floatIcon 4s ease-in-out infinite',
          }}>
            <div style={{
              fontSize: '56px',
              filter: 'drop-shadow(0 10px 20px rgba(14, 165, 233, 0.4))',
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              ':hover': {
                transform: 'scale(1.1)',
              },
            }}>
              🏥
            </div>
            <div style={{
              fontSize: '56px',
              filter: 'drop-shadow(0 10px 20px rgba(102, 126, 234, 0.4))',
              transition: 'transform 0.3s ease',
            }}>
              ⚕️
            </div>
          </div>
          
          <h1 style={{
            fontSize: '3.8rem',
            background: 'linear-gradient(135deg, #0F4454 0%, #0ea5e9 40%, #667eea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '12px',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 20px rgba(14, 165, 233, 0.3)',
            animation: 'fadeInUp 0.6s ease-out',
          }}>
            PharmaCare
          </h1>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#4a5568',
            marginBottom: '48px',
            textAlign: 'center',
            fontWeight: '500',
            background: 'linear-gradient(135deg, #519FAD 0%, #0ea5e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'fadeInUp 0.7s ease-out',
          }}>
            Your Trusted Healthcare Partner
          </p>
          
          <div style={{
            display: 'flex',
            gap: '40px',
            marginBottom: '48px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            animation: 'fadeInUp 0.8s ease-out',
          }}>
            {/* Customer Login Card */}
            <div
              onMouseEnter={() => setHoveredCard('customer')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate('/login/customer')}
              style={{
                background: hoveredCard === 'customer' 
                  ? 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'
                  : 'white',
                borderRadius: '32px',
                boxShadow: hoveredCard === 'customer'
                  ? '0 25px 50px -12px rgba(14, 165, 233, 0.5), 0 0 0 2px #0ea5e9'
                  : '0 15px 35px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(14, 165, 233, 0.15)',
                padding: '38px 28px',
                minWidth: '220px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transform: hoveredCard === 'customer' ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
              }}>
              {/* Glow Effect */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
                opacity: hoveredCard === 'customer' ? 1 : 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none',
              }} />
              
              <div style={{
                fontSize: '68px',
                marginBottom: '20px',
                display: 'inline-block',
                animation: hoveredCard === 'customer' ? 'bounce 0.5s ease' : 'none',
                filter: 'drop-shadow(0 5px 10px rgba(14, 165, 233, 0.2))',
              }}>
                🛒
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.9rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #0F4454 0%, #0ea5e9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Customer
              </h2>
              <p style={{
                fontSize: '0.95rem',
                color: '#718096',
                marginTop: '12px',
                marginBottom: 0,
                lineHeight: '1.4',
              }}>
                Shop medicines, view orders
              </p>
              <div style={{
                marginTop: '20px',
                fontSize: '14px',
                color: '#0ea5e9',
                fontWeight: '600',
                opacity: hoveredCard === 'customer' ? 1 : 0.5,
                transform: hoveredCard === 'customer' ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                Click to continue →
              </div>
            </div>
            
            {/* Admin Login Card */}
            <div
              onMouseEnter={() => setHoveredCard('admin')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate('/login/admin')}
              style={{
                background: hoveredCard === 'admin'
                  ? 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)'
                  : 'white',
                borderRadius: '32px',
                boxShadow: hoveredCard === 'admin'
                  ? '0 25px 50px -12px rgba(102, 126, 234, 0.5), 0 0 0 2px #667eea'
                  : '0 15px 35px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(14, 165, 233, 0.15)',
                padding: '38px 28px',
                minWidth: '220px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transform: hoveredCard === 'admin' ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
              }}>
              {/* Glow Effect */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
                opacity: hoveredCard === 'admin' ? 1 : 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none',
              }} />
              
              <div style={{
                fontSize: '68px',
                marginBottom: '20px',
                display: 'inline-block',
                animation: hoveredCard === 'admin' ? 'bounce 0.5s ease' : 'none',
                filter: 'drop-shadow(0 5px 10px rgba(102, 126, 234, 0.2))',
              }}>
                ⚙️
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.9rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #0F4454 0%, #667eea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Admin
              </h2>
              <p style={{
                fontSize: '0.95rem',
                color: '#718096',
                marginTop: '12px',
                marginBottom: 0,
                lineHeight: '1.4',
              }}>
                Manage inventory & orders
              </p>
              <div style={{
                marginTop: '20px',
                fontSize: '14px',
                color: '#667eea',
                fontWeight: '600',
                opacity: hoveredCard === 'admin' ? 1 : 0.5,
                transform: hoveredCard === 'admin' ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                Click to continue →
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div style={{
            display: 'flex',
            gap: '48px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(14, 165, 233, 0.2)',
            width: '100%',
            justifyContent: 'center',
            animation: 'fadeInUp 0.9s ease-out',
          }}>
            <div style={{ textAlign: 'center', transition: 'transform 0.3s ease', cursor: 'pointer' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #0F4454 0%, #0ea5e9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>10K+</div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px', fontWeight: '500' }}>Happy Customers</div>
            </div>
            <div style={{ textAlign: 'center', transition: 'transform 0.3s ease', cursor: 'pointer' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #0F4454 0%, #0ea5e9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>500+</div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px', fontWeight: '500' }}>Medicines</div>
            </div>
            <div style={{ textAlign: 'center', transition: 'transform 0.3s ease', cursor: 'pointer' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #0F4454 0%, #0ea5e9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>24/7</div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px', fontWeight: '500' }}>Support</div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }
        
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes rotateReverse {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
        
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(3deg);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}