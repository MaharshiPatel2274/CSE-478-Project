class LineChart {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data || [];
        this.selectedCountries = [];
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const margin = { top: 40, right: 120, bottom: 60, left: 60 };
        const baseWidth = container.clientWidth || 800;
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
                .text('Loading data...');
            return;
        }

        const years = this.data.map(d => +d.year);
        const values = this.data.map(d => +d.renewable_share);

        this.xScale = d3.scaleLinear()
            .domain([d3.min(years), d3.max(years)])
            .range([0, width]);

        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .range([height, 0]);

        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(this.xScale).tickFormat(d3.format('d')));

        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(this.yScale));

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

        this.drawSampleLine();
    }

    drawSampleLine() {
        const firstCountry = this.data[0].country;
        const sample = this.data
            .filter(d => d.country === firstCountry)
            .sort((a, b) => a.year - b.year);

        if (!sample.length) return;

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
            .text(firstCountry);
    }
}

