class LineChart {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data || [];
        this.selectedCountries = [];
        this.showTrendLines = true;

        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id "${this.containerId}" not found.`);
            return;
        }

        const margin = { top: 40, right: 120, bottom: 60, left: 60 };
        const baseWidth = container.clientWidth || 800; // fallback width
        const width = baseWidth - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        this.margin = margin;
        this.width = width;
        this.height = height;

        
        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

       
        if (!this.data.length) {
            this.svg.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .text('No data yet (WIP)');
            return;
        }

        
        const years = this.data.map(d => +d.year);
        const values = this.data.map(d => +d.renewable_share);

        const xMin = d3.min(years);
        const xMax = d3.max(years);
        const yMax = d3.max(values);

       
        this.xScale = d3.scaleLinear()
            .domain([xMin, xMax])
            .range([0, width]);

        this.yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);

       
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

       
        this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.format('d'));
        this.yAxis = d3.axisLeft(this.yScale);

       
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(this.xAxis);

        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(this.yAxis);

      
        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 45)
            .text('Year');

        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .text('Renewable Energy Share (%)');

      
        this.svg.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.1)
            .call(d3.axisLeft(this.yScale)
                .tickSize(-width)
                .tickFormat('')
            );

   
        this.line = d3.line()
            .x(d => this.xScale(+d.year))
            .y(d => this.yScale(+d.renewable_share))
            .curve(d3.curveMonotoneX);

     
        // this.setupControls(); // work in progress
        // this.populateCountrySelector(); // work in progress
        // this.tooltip = ... // work in progress

             this.drawPlaceholderLine();
    }

    drawPlaceholderLine() {
       
        const firstCountry = this.data[0].country;
        const sample = this.data
            .filter(d => d.country === firstCountry)
            .sort((a, b) => a.year - b.year);

        if (!sample.length) {
            this.svg.append('text')
                .attr('x', this.width / 2)
                .attr('y', this.height / 2)
                .attr('text-anchor', 'middle')
                .text('No sample series (WIP)');
            return;
        }

        this.svg.append('path')
            .datum(sample)
            .attr('class', 'line')
            .attr('d', this.line)
            .attr('stroke', this.colorScale(firstCountry))
            .attr('fill', 'none');

        this.svg.append('text')
            .attr('x', this.width - 120)
            .attr('y', 20)
            .attr('fill', this.colorScale(firstCountry))
            .text(`${firstCountry} (WIP)`);
    }

  
    updateChart() {
        // work in progress
    }

  
    setupControls() {
        // work in progress
    }

    
    populateCountrySelector() {
        // work in progress
    }
}

