(() => {
  // Utility functions
  const isMobile = () => window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // RAF-based throttle
  const throttleRAF = (fn) => {
    let ticking = false;
    return function(...args) {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
      }
    };
  };

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  const initLiveCards = () => {
    // Skip on mobile
    if (isMobile()) return;

    const cards = document.querySelectorAll('.live-card');

    cards.forEach((card) => {
      const el = card;

      // Throttled mousemove handler
      const handleMouseMove = throttleRAF((event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        el.style.setProperty('--x', `${x}px`);
        el.style.setProperty('--y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -2;
        const rotateY = ((x - centerX) / centerX) * 2;

        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      el.addEventListener('mousemove', handleMouseMove, { passive: true });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  };

  const initYear = () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear().toString();
    }
  };

  const initMobileMenu = () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileToggle = document.getElementById('mobile-toggle-btn');
    const mobileClose = document.getElementById('mobile-close-btn');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
      mobileMenu?.classList.toggle('active');
      document.body.classList.toggle('menu-open', mobileMenu?.classList.contains('active'));
    };

    mobileToggle?.addEventListener('click', toggleMenu);
    mobileClose?.addEventListener('click', toggleMenu);
    mobileLinks.forEach((link) => link.addEventListener('click', () => mobileMenu?.classList.remove('active')));
  };

  const initAnimations = () => {
    const gsapLib = window.gsap;
    const scrollTrigger = window.ScrollTrigger;
    if (!gsapLib || !scrollTrigger) return;

    gsapLib.registerPlugin(scrollTrigger);

    // Header scroll is handled by nav.js - removed duplicate here

    const heroElements = document.querySelectorAll('.gs-fade-up');
    gsapLib.fromTo(
      heroElements,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      }
    );

    gsapLib.utils.toArray('.gs-reveal').forEach((element) => {
      gsapLib.fromTo(
        element,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        }
      );
    });

    // Micro-motion: hero headline lift as products come in
    const heroHeadline = document.querySelector('#hero h1');
    if (heroHeadline) {
      gsapLib.to(heroHeadline, {
        y: -4,
        scrollTrigger: {
          trigger: '#products',
          start: 'top bottom',
          end: 'top center',
          scrub: true,
        },
      });
    }

    // Micro-motion: bottom motif single drop
    const motif = document.querySelector('.hero-motif');
    if (motif) {
      gsapLib.fromTo(
        motif,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 0.85, duration: 0.8, ease: 'power2.out', delay: 0.4 }
      );
    }

    // Parallax shift between hero media and following panel
    const heroMedia = document.querySelector('.hero-media');
    if (heroMedia) {
      gsapLib.to(heroMedia, {
        yPercent: 4,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
    };

    const initParallaxMedia = () => {
        // Skip on mobile
        if (isMobile()) return;

        const parallaxEls = document.querySelectorAll('[data-parallax]');
        if (!parallaxEls.length) return;

    // Throttled mousemove handler
    const onMove = throttleRAF((event) => {
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth - 0.5) * 10;
      const y = (event.clientY / innerHeight - 0.5) * 6;
      parallaxEls.forEach((el) => {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    });

    window.addEventListener('mousemove', onMove, { passive: true });

    parallaxEls.forEach((el) => {
      el.addEventListener('mouseenter', () => el.classList.add('hovered'));
      el.addEventListener('mouseleave', () => el.classList.remove('hovered'));
    });
    };

    const initTexasMap = () => {
        const mapCard = document.querySelector('.texas-map-card');
        const gsapLib = window.gsap;
        const scrollTrigger = window.ScrollTrigger;
        if (!mapCard || !gsapLib || !scrollTrigger) return;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const arcs = mapCard.querySelectorAll('.map-arc');
        arcs.forEach((arc) => {
            if (typeof arc.getTotalLength !== 'function') return;
            const length = arc.getTotalLength();
            arc.style.strokeDasharray = `${length}`;
            arc.style.strokeDashoffset = length;
            gsapLib.to(arc, {
                strokeDashoffset: 0,
                duration: 1.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: mapCard,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            });
        });

        if (prefersReduced) return;

        const nodes = mapCard.querySelectorAll('.map-city');
        gsapLib.fromTo(
            nodes,
            { opacity: 0, y: 8, scale: 0.85 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: 'back.out(1.4)',
                stagger: 0.08,
                scrollTrigger: {
                    trigger: mapCard,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            }
        );
    };

    const initThreeJS = () => {
        const container = document.getElementById('canvas-container');
        const THREE = window.THREE;
        if (!container || !THREE) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#050a07', 2, 20);

    const camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const size = () => ({
      width: container.offsetWidth || container.clientWidth || window.innerWidth,
      height: container.offsetHeight || container.clientHeight || window.innerHeight,
    });
    const { width: initialWidth, height: initialHeight } = size();
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const textureUrl = 'https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=2574&auto=format&fit=crop';
    const foliageTexture = loader.load(textureUrl);
    foliageTexture.wrapS = THREE.RepeatWrapping;
    foliageTexture.wrapT = THREE.RepeatWrapping;

    const numCols = 50;
    const numRows = 40;
    const numInstances = numCols * numRows;
    const geometry = new THREE.PlaneGeometry(1.2, 1.2, 16, 16);

    const instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.index = geometry.index;
    instancedGeometry.attributes.position = geometry.attributes.position;
    instancedGeometry.attributes.uv = geometry.attributes.uv;
    instancedGeometry.attributes.normal = geometry.attributes.normal;

    const offsets = new Float32Array(numInstances * 3);
    const uvOffsets = new Float32Array(numInstances * 2);
    const randoms = new Float32Array(numInstances);

    const width = 26;
    const height = 20;

    for (let i = 0; i < numInstances; i += 1) {
      const col = i % numCols;
      const row = Math.floor(i / numCols);

      const x = (col / numCols) * width - width / 2;
      const y = (row / numRows) * height - height / 2;

      offsets[i * 3 + 0] = x;
      offsets[i * 3 + 1] = y;
      offsets[i * 3 + 2] = 0;

      uvOffsets[i * 2 + 0] = col / numCols;
      uvOffsets[i * 2 + 1] = row / numRows;

      randoms[i] = Math.random();
    }

    instancedGeometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    instancedGeometry.setAttribute('aUvOffset', new THREE.InstancedBufferAttribute(uvOffsets, 2));
    instancedGeometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 1));

    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;

      attribute vec3 aOffset;
      attribute vec2 aUvOffset;
      attribute float aRandom;

      varying vec2 vUv;
      varying float vElevation;
      varying vec3 vNormal;
      varying float vFlow;
      varying float vLeafDetail;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
      }

      mat4 rotationMatrix(vec3 axis, float angle) {
          axis = normalize(axis);
          float s = sin(angle);
          float c = cos(angle);
          float oc = 1.0 - c;
          return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                      0.0,                                0.0,                                0.0,                                1.0);
      }

      void main() {
          vec2 cellUVSize = vec2(1.0/50.0, 1.0/40.0);
          vUv = aUvOffset + uv * cellUVSize;

          vec2 flowSample = aOffset.xy * 0.03 + vec2(uTime * 0.018, -uTime * 0.009);
          vec2 warped = flowSample + vec2(snoise(flowSample * 0.55 + 2.2), snoise(flowSample * 0.55 + 4.7)) * 1.35;
          float ribbonX = sin(warped.x * 1.0) * 0.8;
          float ribbonY = cos(warped.y * 0.8) * 0.55;
          float ribbonDiag = sin((warped.x + warped.y) * 0.7) * 0.45;
          vFlow = ribbonX + ribbonY + ribbonDiag;

          vec3 pos = position;

          float distToCenter = distance(uv, vec2(0.5));
          float volume = smoothstep(0.6, 0.0, distToCenter);

          float leafFreq = 8.0;
          float leafNoise = snoise(vec2(uv.x * leafFreq, uv.y * leafFreq + uTime * 0.5));

          pos.z += volume * 0.4;
          pos.z += leafNoise * 0.15 * volume;

          vLeafDetail = leafNoise;

          float noiseFreq = 0.3;
          float noiseSpeed = 0.3;
          float noiseVal = snoise(vec2(aOffset.x * noiseFreq + uTime * noiseSpeed, aOffset.y * noiseFreq));

          vec2 mouseWorld = uMouse * vec2(13.0, 10.0);
          float dist = distance(aOffset.xy, mouseWorld);
          float mouseInfluence = smoothstep(4.0, 0.0, dist);

          float rotX = noiseVal * 0.5 + mouseInfluence * (aOffset.y - mouseWorld.y);
          float rotY = noiseVal * 0.5 - mouseInfluence * (aOffset.x - mouseWorld.x);

          mat4 rotMat = rotationMatrix(vec3(1.0, 0.0, 0.0), rotX) * rotationMatrix(vec3(0.0, 1.0, 0.0), rotY);
          pos = (rotMat * vec4(pos, 1.0)).xyz;

          float wave = sin(aOffset.x * 0.5 + uTime * 0.5) * 0.2;
          pos.z += wave;

          pos += aOffset;

          vElevation = pos.z;
          vNormal = (rotMat * vec4(normal, 0.0)).xyz;

          gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec3 uColorBoxwood;
      uniform vec3 uColorFern;
      uniform vec3 uColorSage;
      uniform vec3 uColorOlive;

      varying vec2 vUv;
      varying float vElevation;
      varying vec3 vNormal;
      varying float vFlow;
      varying float vLeafDetail;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
      }

      vec2 warp(vec2 p, float t) {
        float n1 = snoise(p * 0.45 + t * 0.25);
        float n2 = snoise(p * 0.25 - t * 0.18 + 6.0);
        return p + vec2(n1, n2) * 1.2;
      }

      void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

          vec3 c1 = uColorBoxwood;
          vec3 c2 = uColorSage;
          vec3 c3 = uColorFern;
          vec3 c4 = uColorOlive;

          float t = vFlow * 0.5 + 0.5;
          vec2 flowUV = warp(vUv * 2.4 + vec2(t * 0.25, -t * 0.15), t + uTime * 0.04);
          float ribbonA = sin(flowUV.x * 5.0 + sin(flowUV.y * 1.5) * 1.6);
          float ribbonB = cos(flowUV.y * 3.4 + cos(flowUV.x * 1.2) * 1.3);
          float ribbonC = sin((flowUV.x + flowUV.y) * 2.2);
          float ribbons = 0.5 + 0.22 * ribbonA + 0.18 * ribbonB + 0.14 * ribbonC;

          float edgeSoft = 0.035;
          float bandA = smoothstep(0.14 - edgeSoft, 0.14 + edgeSoft, ribbons);
          float bandB = smoothstep(0.30 - edgeSoft, 0.30 + edgeSoft, ribbons);
          float bandC = smoothstep(0.46 - edgeSoft, 0.46 + edgeSoft, ribbons);
          float bandD = smoothstep(0.62 - edgeSoft, 0.62 + edgeSoft, ribbons);
          float bandE = smoothstep(0.78 - edgeSoft, 0.78 + edgeSoft, ribbons);
          float bandF = smoothstep(0.92 - edgeSoft, 0.92 + edgeSoft, ribbons);

          vec3 plantColor = c1;
          plantColor = mix(plantColor, c2, bandA);
          plantColor = mix(plantColor, c3, bandB);
          plantColor = mix(plantColor, c2, bandC); // recycle cool tone for extra stripe
          plantColor = mix(plantColor, c4, bandD);
          plantColor = mix(plantColor, c1, bandE); // deep anchor stripe
          plantColor = mix(plantColor, c3, bandF);
          plantColor += vLeafDetail * 0.02;

          vec3 lightDir = normalize(vec3(0.25, 0.45, 1.0));
          float light = max(0.0, dot(vNormal, lightDir));

          float specular = pow(max(0.0, dot(reflect(-lightDir, vNormal), vec3(0.0,0.0,1.0))), 10.0) * 0.25;

          float textureInfluence = 0.25;
          vec3 finalAlbedo = mix(plantColor, plantColor * (gray * 1.3 + 0.15), textureInfluence) + specular;

          float vignette = smoothstep(0.2, 0.7, distance(vUv, vec2(0.5)));
          finalAlbedo *= mix(1.05, 0.85, vignette * 0.6);

          gl_FragColor = vec4(finalAlbedo, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTexture: { value: foliageTexture },
        uColorBoxwood: { value: new THREE.Color('#133316') },
        uColorFern: { value: new THREE.Color('#4caf50') },
        uColorSage: { value: new THREE.Color('#447a68') },
        uColorOlive: { value: new THREE.Color('#b5cc5a') },
      },
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(instancedGeometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    let mouseX = 0;
    let mouseY = 0;

    // Throttled mouse handler for Three.js
    const onMouseMove = throttleRAF((event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseX = (x / rect.width) * 2 - 1;
      mouseY = -(y / rect.height) * 2 + 1;
    });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      material.uniforms.uTime.value = time;

      material.uniforms.uMouse.value.x += (mouseX - material.uniforms.uMouse.value.x) * 0.05;
      material.uniforms.uMouse.value.y += (mouseY - material.uniforms.uMouse.value.y) * 0.05;

      camera.position.x = Math.sin(time * 0.1) * 0.3;
      camera.position.y = Math.cos(time * 0.15) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const { width: newWidth, height: newHeight } = size();
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
  };

  // Lazy-load Three.js when canvas container is visible
  const lazyLoadThreeJS = () => {
    // Skip Three.js entirely on mobile - major performance win
    if (isMobile() || prefersReducedMotion()) {
      const container = document.getElementById('canvas-container');
      if (container) {
        container.style.display = 'none';
      }
      return;
    }

    const container = document.getElementById('canvas-container');
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect();
          // Dynamically load Three.js
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          script.onload = () => setTimeout(initThreeJS, 50);
          document.head.appendChild(script);
        }
      });
    }, { rootMargin: '200px' }); // Start loading 200px before visible

    observer.observe(container);
  };

  const init = () => {
        initLiveCards();
        initYear();
        initMobileMenu();
        initAnimations();
        initTexasMap();
        initParallaxMedia();
        lazyLoadThreeJS();
    };

    onReady(init);
})();
