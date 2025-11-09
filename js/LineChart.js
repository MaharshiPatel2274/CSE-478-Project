class LineChart {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.selectedCountries = [];
        this.showTrendLines = true;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        const margin = { top: 40, right: 120, bottom: 60, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
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

      
        this.xScale = d3.scaleLinear()
            .domain([1990, 2023])
            .range([0, width]);

        this.yScale = d3.scaleLinear()
            .domain([0, 100])
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

        // labels
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
            .x(d => this.xScale(d.year))
            .y(d => this.yScale(d.renewable_share))
            .curve(d3.curveMonotoneX);

     
     
        // this.setupControls(); // work in progress
        // this.populateCountrySelector(); // work in progress
        // this.tooltip = ... // work in progress


    
        this.drawPlaceholderLine();
    }

    drawPlaceholderLine() {
 
        const sample = this.data.filter(d => d.country === "United States")
            .sort((a, b) => a.year - b.year)
            .slice(0, 10); // only a few points

        this.svg.append('path')
            .datum(sample)
            .attr('class', 'line')
            .attr('d', this.line)
            .attr('stroke', '#1f77b4')
            .attr('fill', 'none');

      
        this.svg.append('text')
            .attr('x', this.width - 80)
            .attr('y', 20)
            .attr('fill', '#1f77b4')
            .text('United States (WIP)');
    }


    updateChart() {
        // work in progress
    }


    setupControls() {
        // work in progress
    }
}

