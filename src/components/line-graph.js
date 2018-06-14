import React, {Component} from 'react';
import {scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';
import 'd3-tip';
import * as d3 from 'd3';

export class LineGraph extends Component {

  componentDidMount() {
    const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%SZ');

    this.data = this.props.data.map(x => {
      return ({
        ...x,
        start_date: parseTime(x.start_date),
        moving_time: x.moving_time / 60
      })
    }).filter(x => x.moving_time > 6);


    this.createBarChart();
  }

  componentDidUpdate() {
    const filteredData = this.data.filter(x => {
      const hours = x.start_date.getHours();
      return hours >= this.props.limits.start && hours <= this.props.limits.end;
    });

    this.x.domain(d3.extent(filteredData, (d) => d.start_date));
    this.y.domain([0, d3.max(filteredData, (d) => d.moving_time)]);

    this.g.transition();

    // Make the changes
    this.g.select('.line')   // change the line
      // .duration(750)
      .attr('d', this.line(filteredData));
    this.g.select('.x.axis') // change the x axis
      // .duration(750)
      .call(this.x);
    this.g.select('.y.axis') // change the y axis
      // .duration(750)
      .call(this.y);

    this.g.selectAll('.dot').remove();

    this.g.selectAll('.dot')
      .data(filteredData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => this.x(d.start_date))
      .attr('cy', (d) => this.y(d.moving_time))
      .attr('r', 5);
  }

  createBarChart() {

    const node = this.node;

    const filteredData = this.data.filter(x => {
      const hours = x.start_date.getHours();
      return hours >= this.props.limits.start && hours <= this.props.limits.end;
    });

    const svg = this.svg = select(node);
    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    const g = this.g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const x = this.x = d3.scaleTime()
      .rangeRound([0, width]);
    x.domain(d3.extent(filteredData, d => d.start_date));

    const y = this.y = scaleLinear()
      .rangeRound([height, 0]);
    y.domain(d3.extent(filteredData, d => d.moving_time));

    const line = this.line = d3.line()
      .x((d) => x(d.start_date))
      .y((d) => y(d.moving_time))
      .curve(d3.curveMonotoneX);

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('class', 'y axis')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'end')
      .text('Time (mins)');

    g.append('path')
      .datum(filteredData)
      .attr('class', 'line')
      .attr('d', line);

    g.selectAll('.dot')
      .data(filteredData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.start_date))
      .attr('cy', (d) => y(d.moving_time))
      .attr('r', 5);
  }

  render() {

    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    return <svg
      ref={node => this.node = node}
      width={this.props.size.width + margin.left + margin.right}
      height={this.props.size.height + margin.top + margin.bottom}></svg>
  }
}
