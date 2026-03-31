import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import TopNavigation from "../components/TopNavigation";

const LandingPage = () => {
  const navigate = useNavigate();

  // Loading state to prevent scroll issues
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Refs for different sections
  const heroRef = useRef(null);
  const whyRef = useRef(null);
  const ctaRef = useRef(null);
  const footerRef = useRef(null);

  // Set page as loaded after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100); // Small delay to ensure smooth initial render

    return () => clearTimeout(timer);
  }, []);

  // useInView hooks for each section - optimized with better thresholds
  const whyInView = useInView(whyRef, { once: true, margin: "-80px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });
  const footerInView = useInView(footerRef, { once: true, margin: "-50px" });

  // Individual card refs for more granular control
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  // Individual card in-view hooks
  const card1InView = useInView(card1Ref, { once: true, margin: "-50px" });
  const card2InView = useInView(card2Ref, { once: true, margin: "-50px" });
  const card3InView = useInView(card3Ref, { once: true, margin: "-50px" });

  const handleJoinClick = (userType) => {
    navigate(`/${userType}/signup`);
  };

  // Animation variants - diverse animation styles
  const whySectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  // Fade in from left
  const fadeInLeftVariants = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Fade in from right
  const fadeInRightVariants = {
    hidden: {
      opacity: 0,
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Scale in animation
  const scaleInVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Slide up animation (for titles)
  const slideUpVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Fade in simple
  const fadeInVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.95,
    },
  };
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-dark-900 dark group/design-root overflow-x-hidden"
      style={{
        overflowY: isPageLoaded ? "auto" : "hidden", // Prevent scroll during load
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <TopNavigation />

        {/* Hero Section - Always visible on load */}
        <motion.div
          ref={heroRef}
          className="px-40 flex flex-1 justify-center py-5 smooth-animation"
          initial={{ opacity: 0, y: 0 }} // No initial Y offset to prevent scroll issues
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="layout-content-container flex flex-col max-w-[800px] flex-1">
            <div className="container">
              <div className="p-4">
                <motion.div
                  className="flex min-h-[400px] flex-col gap-6 bg-center bg-no-repeat rounded-xl items-center justify-center p-4 relative overflow-hidden border border-neon-blue/20 gpu-accelerated"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(10, 15, 28, 0.8) 0%, rgba(15, 22, 41, 0.9) 100%), url("https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                  }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                >
                  {/* Neon glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-accent-purple/10 pointer-events-none"></div>

                  <motion.div
                    className="flex flex-col gap-2 text-center relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
                  >
                    <motion.h1
                      className="text-white text-4xl font-black leading-tight tracking-[-0.033em] sm:text-5xl font-display animate-glow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.5,
                      }}
                    >
                      Show. Discover. Connect.
                    </motion.h1>
                    <motion.h2
                      className="text-gray-300 text-sm sm:text-base font-normal leading-normal font-sans"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.6,
                      }}
                    >
                      Showcase your projects, discover talent, and connect with
                      developers and employers.
                    </motion.h2>
                  </motion.div>
                  <motion.button
                    onClick={() => navigate("/explore")}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 sm:h-12 sm:px-5 bg-neon-blue hover:bg-neon-blue-light text-dark-900 text-sm font-bold leading-normal tracking-[0.015em] sm:text-base transition-all duration-300 shadow-neon-button hover:shadow-neon-strong relative z-10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.7 }}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                  >
                    <span className="truncate">Explore Projects</span>
                  </motion.button>
                </motion.div>
              </div>
            </div>

            {/* Why Section */}
            <motion.div
              ref={whyRef}
              className="flex flex-col gap-10 px-4 py-10 smooth-animation"
              initial="hidden"
              animate={whyInView ? "visible" : "hidden"}
              variants={whySectionVariants}
            >
              <motion.div
                className="flex flex-col gap-4"
                variants={fadeInVariants}
              >
                <motion.h1
                  className="text-white tracking-light text-[32px] font-bold leading-tight sm:text-4xl max-w-[720px] font-heading"
                  variants={slideUpVariants}
                >
                  Why ElevateMe?
                </motion.h1>
                <motion.p
                  className="text-gray-300 text-base font-normal leading-normal max-w-[720px] font-sans"
                  variants={fadeInRightVariants}
                >
                  ElevateMe is the premier platform for developers and employers
                  to showcase projects, provide feedback, and connect for
                  hiring.
                </motion.p>
              </motion.div>

              {/* Feature Cards */}
              <motion.div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                {/* Card 1 - Slide in from left */}
                <motion.div
                  ref={card1Ref}
                  className="flex flex-col gap-3 pb-3 bg-dark-800 rounded-xl p-6 border border-neon-blue/20 hover:border-neon-blue/40 transition-all duration-200 hover:shadow-neon gpu-accelerated"
                  initial="hidden"
                  animate={card1InView ? "visible" : "hidden"}
                  variants={fadeInLeftVariants}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    rotateX: 5,
                    transition: { duration: 0.3, ease: "easeInOut" },
                  }}
                  style={{ perspective: "1000px" }}
                >
                  <motion.div
                    className="w-8 h-8 text-neon-blue"
                    variants={scaleInVariants}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-white text-base font-bold font-heading">
                      Showcase Your Work
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Showcase your projects in a global marketplace of
                      developers and employers.
                    </p>
                  </div>
                </motion.div>

                {/* Card 2 - Scale in from center */}
                <motion.div
                  ref={card2Ref}
                  className="flex flex-col gap-3 pb-3 bg-dark-800 rounded-xl p-6 border border-neon-blue/20 hover:border-neon-blue/40 transition-all duration-200 hover:shadow-neon gpu-accelerated"
                  initial="hidden"
                  animate={card2InView ? "visible" : "hidden"}
                  variants={scaleInVariants}
                  whileHover={{
                    y: -8,
                    scale: 1.05,
                    rotateX: 5,
                    transition: { duration: 0.3, ease: "easeInOut" },
                  }}
                  style={{ perspective: "1000px" }}
                >
                  <motion.div
                    className="w-8 h-8 text-neon-blue"
                    variants={scaleInVariants}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 17v2H2v-2s0-4 7-4 7 4 7 4zm-3.5-9.5A3.5 3.5 0 1 0 9 4a3.5 3.5 0 0 0 3.5 3.5z" />
                      <path d="M19.5 7.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5h3z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-white text-base font-bold font-heading">
                      Connect with Talent
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Connect with talented developers and employers looking for
                      their next opportunity.
                    </p>
                  </div>
                </motion.div>

                {/* Card 3 - Slide in from right */}
                <motion.div
                  ref={card3Ref}
                  className="flex flex-col gap-3 pb-3 bg-dark-800 rounded-xl p-6 border border-neon-blue/20 hover:border-neon-blue/40 transition-all duration-200 hover:shadow-neon gpu-accelerated"
                  initial="hidden"
                  animate={card3InView ? "visible" : "hidden"}
                  variants={fadeInRightVariants}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    rotateX: 5,
                    transition: { duration: 0.3, ease: "easeInOut" },
                  }}
                  style={{ perspective: "1000px" }}
                >
                  <motion.div
                    className="w-8 h-8 text-neon-blue"
                    variants={scaleInVariants}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-white text-base font-bold font-heading">
                      Find Your Next Opportunity
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Find your next project or hire your next team member with
                      ElevateMe.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
            {/* CTA Section */}
            <motion.div
              ref={ctaRef}
              className="container"
              initial="hidden"
              animate={ctaInView ? "visible" : "hidden"}
              variants={whySectionVariants}
            >
              <motion.div
                className="flex flex-col justify-end gap-8 px-4 py-10 sm:px-10 sm:py-20"
                variants={fadeInVariants}
              >
                <motion.div
                  className="flex flex-col gap-2 text-center"
                  variants={fadeInVariants}
                >
                  <motion.h1
                    className="text-white tracking-light text-[32px] font-bold leading-tight sm:text-4xl max-w-[720px] font-heading animate-glow"
                    variants={slideUpVariants}
                  >
                    Ready to get started?
                  </motion.h1>
                  <motion.p
                    className="text-gray-300 text-base font-normal leading-normal max-w-[720px] font-sans"
                    variants={fadeInRightVariants}
                  >
                    Join ElevateMe today and start showcasing your projects,
                    discovering talent, and connecting with developers and
                    employers.
                  </motion.p>
                </motion.div>
                <motion.div
                  className="flex flex-1 justify-center"
                  variants={scaleInVariants}
                >
                  <div className="flex justify-center">
                    <div className="flex flex-1 gap-3 flex-wrap max-w-[480px] justify-center">
                      <motion.button
                        onClick={() => handleJoinClick("developer")}
                        className="flex grow cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-neon-blue hover:bg-neon-blue-light text-dark-900 text-sm font-bold sm:h-12 sm:text-base transition-all duration-300 shadow-neon-button hover:shadow-neon-strong"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <span className="truncate">Join as Developer</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.footer
              ref={footerRef}
              className="flex justify-center"
              initial="hidden"
              animate={footerInView ? "visible" : "hidden"}
              variants={whySectionVariants}
            >
              <div className="flex max-w-[960px] flex-1 flex-col">
                <motion.div
                  className="flex flex-col gap-6 px-5 py-10 text-center"
                  variants={fadeInVariants}
                >
                  <motion.div
                    className="flex flex-wrap items-center justify-center gap-6 sm:flex-row sm:justify-around"
                    variants={containerVariants}
                  >
                    {["Contact Us", "Privacy Policy", "Terms of Service"].map(
                      (text, index) => (
                        <motion.a
                          key={text}
                          className="text-[#8dcece] text-base font-normal min-w-40 hover:text-neon-blue transition-colors duration-300"
                          href="#"
                          variants={fadeInLeftVariants}
                          whileHover={{ y: -2, transition: { duration: 0.2 } }}
                          custom={index}
                        >
                          {text}
                        </motion.a>
                      )
                    )}
                  </motion.div>
                  <motion.div
                    className="flex flex-wrap justify-center gap-4"
                    variants={fadeInRightVariants}
                  >
                    {/* Icons (Twitter, LinkedIn, GitHub) go here */}
                  </motion.div>
                  <motion.p
                    className="text-[#8dcece] text-base font-normal"
                    variants={slideUpVariants}
                  >
                    © 2026 ElevateMe. All rights reserved.
                  </motion.p>
                </motion.div>
              </div>
            </motion.footer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
