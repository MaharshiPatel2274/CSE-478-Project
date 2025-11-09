class WorldMap {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data || [];
        this.currentYear = 2023;
        this.colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, 100]);
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        const width = container.clientWidth || 800;
        const height = 600;

        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        this.projection = d3.geoNaturalEarth1()
            .scale(width / 6)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                this.svg.selectAll('g').attr('transform', event.transform);
            });
        this.svg.call(zoom);

        this.mapGroup = this.svg.append('g');

        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('padding', '6px 8px')
            .style('background', 'rgba(0,0,0,0.7)')
            .style('color', '#fff')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('opacity', 0);

        this.loadMapData();
    }

    async loadMapData() {
        try {
            const worldData = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
            const countries = topojson.feature(worldData, worldData.objects.countries);

            this.mapGroup.selectAll('path')
                .data(countries.features)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', this.path)
                .attr('fill', d => this.getCountryColor(d))
                .attr('stroke', '#cccccc')
                .attr('stroke-width', 0.5)
                .on('mouseover', (event, d) => this.handleMouseOver(event, d))
                .on('mouseout', () => this.handleMouseOut());

        } catch (error) {
            console.error('Error loading map:', error);
        }
    }

    getCountryColor(feature) {
        const row = this.getCountryData(feature, this.currentYear);
        if (row && row.renewable_share != null) {
            return this.colorScale(row.renewable_share);
        }
        return '#e0e0e0';
    }

    getCountryData(feature, year) {
        const name = feature.properties.name;
        return this.data.find(d => d.country === name && d.year === year);
    }

    handleMouseOver(event, d) {
        const countryData = this.getCountryData(d, this.currentYear);
        const countryName = d.properties.name;
        let html = `<strong>${countryName}</strong><br>Year: ${this.currentYear}<br>`;
        html += (countryData && countryData.renewable_share != null)
            ? `Renewable Share: ${countryData.renewable_share.toFixed(1)}%`
            : 'Data not available';

        this.tooltip
            .style('opacity', 0.95)
            .html(html)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }

    handleMouseOut() {
        this.tooltip.style('opacity', 0);
    }
}
