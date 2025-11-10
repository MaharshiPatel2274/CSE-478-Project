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
        const maxY = Math.max(100, d3.max(this.data, d => +d.renewable_share || 0));

        this.xScale = d3.scaleLinear()
            .domain([d3.min(years) || 1990, d3.max(years) || 2023])
            .range([0, width]);

        this.yScale = d3.scaleLinear()
            .domain([0, maxY])
            .range([height, 0]);

        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.format('d'));
        this.yAxis = d3.axisLeft(this.yScale);

        this.svg.append('g')
            .attr('class', 'x-axis axis')
            .attr('transform', `translate(0,${height})`)
            .call(this.xAxis);

        this.svg.append('g')
            .attr('class', 'y-axis axis')
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

        this.tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

        this.setupControls();
        this.populateCountrySelector();
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
    populateCountrySelector() {
        const countries = [...new Set(this.data.map(d => d.country))].sort();
        const select = document.getElementById('country-select');
        if (!select) {
            this.selectedCountries = countries.slice(0, 1);
            this.updateChart();
            return;
        }
        select.innerHTML = '';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            select.appendChild(option);
        });
        const defaults = ['United States', 'China', 'Germany', 'India', 'Brazil'];
        defaults.forEach(c => {
            const opt = select.querySelector(`option[value="${c}"]`);
            if (opt) {
                opt.selected = true;
                this.selectedCountries.push(c);
            }
        });
        if (!this.selectedCountries.length) this.selectedCountries = countries.slice(0, 1);
        this.updateChart();
    }

    setupControls() {
        const select = document.getElementById('country-select');
        if (select) {
            select.addEventListener('change', () => {
                this.selectedCountries = Array.from(select.selectedOptions).map(o => o.value);
                this.updateChart();
            });
        }
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const list = (e.currentTarget.dataset.countries || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
                if (!list.length) return;
                if (select) {
                    Array.from(select.options).forEach(o => { o.selected = list.includes(o.value); });
                }
                this.selectedCountries = list;
                this.updateChart();
            });
        });
        const clearBtn = document.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.selectedCountries = [];
                if (select) select.selectedIndex = -1;
                this.updateChart();
            });
        }
        const trend = document.getElementById('show-trend-lines');
        if (trend) {
            this.showTrendLines = trend.checked;
            trend.addEventListener('change', e => {
                this.showTrendLines = e.target.checked;
                this.updateChart();
            });
        }
    }

    updateChart() {
        this.svg.selectAll('.line').remove();
        this.svg.selectAll('.trend-line').remove();
        this.svg.selectAll('.legend-group').remove();
        this.svg.selectAll('.point').remove();
        this.svg.selectAll('text').filter((d, i, nodes) => d == null && nodes[i].classList.contains('axis-label') === false).remove();

        if (!this.selectedCountries.length) {
            this.drawSampleLine();
            return;
        }

        this.selectedCountries.forEach((country, i) => {
            const series = this.data
                .filter(d => d.country === country && d.renewable_share != null)
                .sort((a, b) => +a.year - +b.year);
            if (!series.length) return;

            this.svg.append('path')
                .datum(series)
                .attr('class', 'line')
                .attr('d', this.line)
                .attr('stroke', this.colorScale(country))
                .attr('fill', 'none');

            if (this.showTrendLines) this.drawTrendLine(series, country);

            this.svg.selectAll(`.point-${i}`)
                .data(series)
                .enter()
                .append('circle')
                .attr('class', `point point-${i}`)
                .attr('cx', d => this.xScale(+d.year))
                .attr('cy', d => this.yScale(+d.renewable_share))
                .attr('r', 3)
                .attr('fill', this.colorScale(country))
                .on('mouseover', (event, d) => this.handlePointMouseOver(event, d, country))
                .on('mouseout', () => this.handleMouseOut());
        });

        this.drawLegend();
    }

    drawTrendLine(data, country) {
        const n = data.length;
        if (n < 2) return;
        const sumX = d3.sum(data, d => +d.year);
        const sumY = d3.sum(data, d => +d.renewable_share);
        const sumXY = d3.sum(data, d => (+d.year) * (+d.renewable_share));
        const sumX2 = d3.sum(data, d => (+d.year) * (+d.year));
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const [x0, x1] = this.xScale.domain();
        const trendData = [
            { year: x0, value: slope * x0 + intercept },
            { year: x1, value: slope * x1 + intercept }
        ];
        const tline = d3.line()
            .x(d => this.xScale(d.year))
            .y(d => this.yScale(d.value));
        this.svg.append('path')
            .datum(trendData)
            .attr('class', 'trend-line')
            .attr('d', tline)
            .attr('stroke', this.colorScale(country))
            .attr('stroke-dasharray', '5,5')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none')
            .attr('opacity', 0.5);
    }

    drawLegend() {
        const g = this.svg.append('g')
            .attr('class', 'legend-group')
            .attr('transform', `translate(${this.width + 10}, 0)`);

        this.selectedCountries.forEach((country, i) => {
            const item = g.append('g')
                .attr('transform', `translate(0, ${i * 25})`)
                .style('cursor', 'pointer')
                .on('click', () => this.toggleCountry(country));

            item.append('line')
                .attr('x1', 0).attr('x2', 20)
                .attr('y1', 10).attr('y2', 10)
                .attr('stroke', this.colorScale(country))
                .attr('stroke-width', 2.5);

            item.append('text')
                .attr('x', 25)
                .attr('y', 14)
                .text(country)
                .style('font-size', '12px')
                .style('fill', '#333');
        });
    }

    toggleCountry(country) {
        const idx = this.selectedCountries.indexOf(country);
        if (idx > -1) this.selectedCountries.splice(idx, 1);
        else this.selectedCountries.push(country);

        const select = document.getElementById('country-select');
        if (select) {
            Array.from(select.options).forEach(o => {
                o.selected = this.selectedCountries.includes(o.value);
            });
        }
        this.updateChart();
    }

    handlePointMouseOver(event, d, country) {
        this.tooltip.transition().duration(200).style('opacity', 0.9);
        this.tooltip.html(
            `<strong>${country}</strong><br>Year: ${+d.year}<br>Renewable Share: ${(+d.renewable_share).toFixed(1)}%`
        )
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }

    handleMouseOut() {
        this.tooltip.transition().duration(500).style('opacity', 0);
    }

    updateSelectedCountry(country) {
        if (!this.selectedCountries.includes(country)) {
            this.selectedCountries.push(country);
            const select = document.getElementById('country-select');
            if (select) {
                Array.from(select.options).forEach(o => {
                    o.selected = this.selectedCountries.includes(o.value);
                });
            }
            this.updateChart();
        }
    }
}