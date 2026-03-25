document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup SVG paths for animation
    const drawPaths = document.querySelectorAll('.draw-path');
    
    // Calculate total lengths and set initial dasharray/offset
    drawPaths.forEach(path => {
        let length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length; // start hidden
    });

    // Group references
    const foundations = document.querySelectorAll('.foundation-path');
    const floors = [
        document.querySelector('.floor-path.f1'),
        document.querySelector('.floor-path.f2'),
        document.querySelector('.floor-path.f3'),
        document.querySelector('.floor-path.f4'),
        document.querySelector('.floor-path.f5'),
        document.querySelector('.floor-path.f6')
    ];
    
    const windowsGroups = [
        document.querySelectorAll('.window-path.w1'),
        document.querySelectorAll('.window-path.w2'),
        document.querySelectorAll('.window-path.w3'),
        document.querySelectorAll('.window-path.w4'),
        document.querySelectorAll('.window-path.w5'),
        document.querySelectorAll('.window-path.w6')
    ];

    const roofs = document.querySelectorAll('.roof-path');
    const lights = document.getElementById('lights');
    const craneGroup = document.getElementById('crane-group');
    const hookPath = document.querySelector('.hook-path');
    const cranePaths = document.querySelectorAll('.crane-path');
    const outroText = document.querySelector('.outro-text');
    const scrollContainer = document.querySelector('.scroll-container');
    
    let currentScroll = 0;
    let targetScroll = 0;
    
    // Listen for scroll
    window.addEventListener('scroll', () => {
        const maxScroll = scrollContainer.offsetHeight - window.innerHeight;
        const scrollAmount = window.scrollY;
        targetScroll = Math.min(Math.max(scrollAmount / maxScroll, 0), 1);
    });
    
    // Utility to map value from one range to another
    function mapRange(value, inMin, inMax, outMin, outMax) {
        if (value <= inMin) return outMin;
        if (value >= inMax) return outMax;
        return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    }
    
    function setPathProgress(nodeList, progress) {
        nodeList.forEach(node => {
            const length = node.getTotalLength();
            node.style.strokeDashoffset = length * (1 - progress);
        });
    }

    function render() {
        // Ease scroll for smoothing
        currentScroll += (targetScroll - currentScroll) * 0.1;
        
        // 0 - 0.15: Foundation and Crane built
        const foundationProgress = mapRange(currentScroll, 0, 0.15, 0, 1);
        setPathProgress(foundations, foundationProgress);
        setPathProgress(cranePaths, foundationProgress);
        
        // 0.15 - 0.40: Floors (Sequential)
        const floorTotalProgress = mapRange(currentScroll, 0.15, 0.40, 0, 1);
        floors.forEach((floor, index) => {
            const sliceSize = 1 / floors.length;
            const start = index * sliceSize;
            const end = (index + 1) * sliceSize;
            const p = mapRange(floorTotalProgress, start, end, 0, 1);
            if (floor) {
                const length = floor.getTotalLength();
                floor.style.strokeDashoffset = length * (1 - p);
            }
        });
        
        // 0.40 - 0.65: Windows (Sequential)
        const windowTotalProgress = mapRange(currentScroll, 0.40, 0.65, 0, 1);
        windowsGroups.forEach((winList, index) => {
            const sliceSize = 1 / windowsGroups.length;
            const start = index * sliceSize;
            const end = (index + 1) * sliceSize;
            const p = mapRange(windowTotalProgress, start, end, 0, 1);
            setPathProgress(winList, p);
        });

        // 0.65 - 0.80: Roof
        const roofProgress = mapRange(currentScroll, 0.65, 0.80, 0, 1);
        setPathProgress(roofs, roofProgress);
        
        // 0.80 - 1.00: Lights on and Crane away
        const endProgress = mapRange(currentScroll, 0.80, 1.00, 0, 1);
        lights.style.opacity = endProgress;
        
        // Crane move away
        const craneTranslateX = endProgress * -400; // move left
        craneGroup.style.transform = `translateX(${craneTranslateX}px)`;
        
        // Retract hook
        if (hookPath) {
            const hookLength = hookPath.getTotalLength();
            hookPath.style.strokeDashoffset = -hookLength * endProgress;
        }
        
        // Check for Outro section (which should be visible near the end)
        if (targetScroll >= 0.99) {
            outroText.classList.add('visible');
        } else {
            outroText.classList.remove('visible');
        }

        requestAnimationFrame(render);
    }
    
    // Start loop
    render();
});
