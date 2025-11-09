let worldMapViz, lineChartViz, globalData;

document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    initVisualizations();
    setupNavigation();
});

async function loadData() {
    try {
        globalData = await d3.csv('data/renewable_energy_data.csv');
        globalData.forEach(d => {
            d.year = +d.year;
            d.renewable_share = +d.renewable_share;
            d.solar_share = +d.solar_share;
            d.wind_share = +d.wind_share;
            d.hydro_share = +d.hydro_share;
        });
    } catch (error) {
        console.error('Error loading data:', error);
        globalData = [];
    }
}

function initVisualizations() {
    worldMapViz = new WorldMap('worldMapContainer', globalData);
    lineChartViz = new LineChart('lineChartContainer', globalData);
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const visualizations = document.querySelectorAll('.visualization');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetViz = this.dataset.viz;
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            visualizations.forEach(viz => {
                viz.classList.remove('active');
            });
            
            const targetSection = document.getElementById(targetViz);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}
