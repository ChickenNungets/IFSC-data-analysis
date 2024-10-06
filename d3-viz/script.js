// Load CSV data and initialize the chart
d3.csv("elo_ratings_over_time.csv").then(function(data) {
    data.forEach(d => {
      d.date = new Date(d.date);  // Parse the date
      d.elo_rating = +d.elo_rating;  // Convert Elo rating to number
    });
  
    window.fullEloData = data;  // Store the full dataset globally
  
    // Initialize chart with default settings
    updateChart(new Date("2024-01-01"), 20, "female", "lead");  // Default date, gender, discipline, top N
  
    // Add event listener to the "Update" button
    d3.select("#updateChart").on("click", function() {
      const currentDate = new Date(d3.select("#startDate").node().value);
      const topN = +d3.select("#topN").node().value;
      const gender = d3.select("#gender").node().value;
      const discipline = d3.select("#discipline").node().value;
  
      // Update chart based on the user's input
      updateChart(currentDate, topN * 2, gender, discipline);
    });
  
    // Initialize the play bar (slider)
    const timeSlider = d3.select("#timeSlider");
    timeSlider.on("input", function() {
      const sliderValue = +this.value;
      const date = getDateFromSlider(sliderValue);  // Compute date from slider value
      const topN = +d3.select("#topN").node().value;
      const gender = d3.select("#gender").node().value;
      const discipline = d3.select("#discipline").node().value;
  
      // Update chart based on the current slider date
      updateChart(date, topN * 2, gender, discipline);
    });
  });
  
  // Function to get the most recent Elo ratings up to a specific date
  function getTopAthletesUpToDate(data, currentDate, topN, gender, discipline) {
    // Filter for the gender and discipline
    let filteredData = data.filter(d => {
      return d.date <= currentDate &&  // Only consider records up to the current date
             (gender === "all" || d.gender === gender) &&  // Filter by gender if applicable
             (discipline === "all" || d.discipline === discipline);  // Filter by discipline if applicable
    });
  
    // Create a dictionary to store the most recent Elo rating for each athlete
    const mostRecentElo = {};
    filteredData.forEach(d => {
      // If the athlete has no Elo recorded yet, or if this record is more recent, update their Elo
      if (!mostRecentElo[d.athlete_name] || d.date > mostRecentElo[d.athlete_name].date) {
        mostRecentElo[d.athlete_name] = d;
      }
    });
  
    // Convert the result into an array and sort by Elo rating in descending order
    const topAthletes = Object.values(mostRecentElo).sort((a, b) => b.elo_rating - a.elo_rating);
  
    // Return the top N athletes
    return topAthletes.slice(0, topN);
  }
  
  // Function to update the D3 chart
  function updateChart(currentDate, topN, gender, discipline) {
    // Get the top N athletes for the given date, gender, and discipline
    const topAthletes = getTopAthletesUpToDate(window.fullEloData, currentDate, topN, gender, discipline);
  
    // Dynamically adjust SVG height based on topN
    const barHeight = 30; // Reduced height per bar for more compact display
    const svgHeight = barHeight * topN + 50; // Ensure all bars fit within the height
    const svg = d3.select("#eloChart").attr("height", svgHeight);
    const width = +svg.attr("width");
  
    // Set up the x and y scales
    const xScale = d3.scaleLinear()
                     .domain([d3.min(topAthletes, d => d.elo_rating), d3.max(topAthletes, d => d.elo_rating)])
                     .range([0, width]);
  
    const yScale = d3.scaleBand()
                     .domain(topAthletes.map(d => d.athlete_name))
                     .range([0, svgHeight])
                     .padding(0.01); // Reduce padding to make bars tighter
  
    // Bind the data to the bars
    const bars = svg.selectAll(".bar").data(topAthletes, d => d.athlete_name);
  
    // Exit old bars
    bars.exit().remove();
  
    // Enter new bars
    const barEnter = bars.enter()
        .append("g")
        .attr("class", "bar");

    // Append the rectangles (bars) and text (labels)
    barEnter.append("rect")
            .attr("x", 0)
            .attr("y", d => yScale(d.athlete_name))
            .attr("width", 0)  // Start width at 0 for smooth transitions
            .attr("height", yScale.bandwidth());  // Use yScale.bandwidth() for consistent height
  
    barEnter.append("text")
            .attr("x", d => xScale(d.elo_rating) - 10)
            .attr("y", d => yScale(d.athlete_name) + yScale.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("fill", "white")
            .attr("text-anchor", "end")
            .text(d => d.athlete_name);
  
    // Merge enter and update selections
    const barUpdate = barEnter.merge(bars);
  
    // Update existing and newly entered bars
    barUpdate.transition()
        .duration(800)
        .select("rect")
        .attr("width", d => xScale(d.elo_rating))  // Ensure width is updated for both enter and update
        .attr("y", d => yScale(d.athlete_name))    // Ensure y-position is updated for both enter and update
        .attr("height", yScale.bandwidth());       // Ensure height is updated for consistency

    // Update text labels for both new and existing bars
    barUpdate.select("text")
        .transition()
        .duration(800)
        .attr("x", d => xScale(d.elo_rating) - 10)
        .attr("y", d => yScale(d.athlete_name) + yScale.bandwidth() / 2)
        .text(d => d.athlete_name);
  
    // Also handle the update for y-axis labels in case they change positions
    svg.selectAll(".bar")
       .attr("transform", d => `translate(0, ${yScale(d.athlete_name)})`);
}


  
  // Function to calculate the current date from the slider value
  function getDateFromSlider(sliderValue) {
    const startDate = new Date(d3.select("#startDate").node().value);
    const endDate = new Date(d3.select("#endDate").node().value);
  
    // Compute the date range between the start and end date
    const timeRange = endDate.getTime() - startDate.getTime();
  
    // Calculate the corresponding date for the given slider value (0-100)
    const currentDate = new Date(startDate.getTime() + (sliderValue / 100) * timeRange);
  
    return currentDate;
  }
  