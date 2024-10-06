// Load data
d3.csv("elo_ratings_over_time.csv").then(function(data) {

    // Parse date and elo values
    const parseDate = d3.timeParse("%Y-%m-%d");
  
    // Set up dimensions and margins
    const margin = { top: 20, right: 30, bottom: 50, left: 50 },
          width = 1000 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;
  
    // Create SVG container
    const svg = d3.select("#eloChart")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Scale for X (time) and Y (Elo rating)
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
  
    // Set Elo threshold for visibility
    const eloThreshold = 2300;
  
    // Filter data based on discipline and gender
    function updateChart() {
      const selectedDiscipline = d3.select("#discipline").node().value;
      const selectedGender = d3.select("#gender").node().value;
  
      const filteredData = data.filter(d => 
        d.discipline === selectedDiscipline &&
        d.gender === selectedGender &&
        +d.elo_rating >= eloThreshold);
  
      // Map data for each athlete
      const athletes = d3.groups(filteredData, d => d.athlete_name);

      // Sort each athlete's data by date
      athletes.forEach(athlete => {
        athlete[1].sort((a, b) => parseDate(a.date) - parseDate(b.date));
      });
    

  
      // Set domains
      xScale.domain(d3.extent(filteredData, d => parseDate(d.date)));
      yScale.domain([eloThreshold, d3.max(filteredData, d => +d.elo_rating)]);
  
      // Clear previous lines
      svg.selectAll("*").remove();
  
      // Axis setup
      svg.append("g")
         .attr("transform", `translate(0,${height})`)
         .call(d3.axisBottom(xScale));
  
      svg.append("g")
         .call(d3.axisLeft(yScale));
  
      // Line generator
      const line = d3.line()
                     .x(d => xScale(parseDate(d.date)))
                     .y(d => yScale(+d.elo_rating))
                     .curve(d3.curveBasis);  // Smooth the lines
  
      // Draw lines for each athlete
      svg.selectAll(".line")
         .data(athletes)
         .enter()
         .append("path")
         .attr("class", "line")
         .attr("d", d => line(d[1]))  // Access the athlete's Elo data
         .attr("stroke", (d, i) => d3.schemeCategory10[i % 10])  // Assign color
         .attr("fill", "none")
         .attr("stroke-width", 2);
  
      // Add tooltips on hover (optional)
      svg.selectAll(".line")
         .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("stroke-width", 4);
         })
         .on("mouseout", function() {
            d3.select(this)
              .attr("stroke-width", 2);
         });
    }
  
    // Add event listeners to update chart on filter change
    d3.select("#discipline").on("change", updateChart);
    d3.select("#gender").on("change", updateChart);
  
    // Initial chart render
    updateChart();
  });
  