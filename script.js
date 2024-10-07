d3.csv("elo_ratings_over_time.csv").then(function(data) {

    data.forEach(d => {
      d.date = new Date(d.date);  
      d.elo_rating = +d.elo_rating;  
    });
  
    window.fullEloData = data; 
    window.delay = 100;  // Default delay for transitions
  
    // Initialize chart with default settings
    updateChart(new Date("2024-01-01"), 20, "male", "boulder", window.delay);  // Default date, gender, discipline, top N
  
    // Add event listener to the "Update" button
    d3.select("#updateChart").on("click", function() {
      const currentDate = new Date(d3.select("#startDate").node().value);
      const topN = +d3.select("#topN").node().value;
      const gender = d3.select("#gender").node().value;
      const discipline = d3.select("#discipline").node().value;
  
      updateChart(currentDate, topN * 2, gender, discipline, window.delay);
    });
  
    // Initialize the play bar (slider)
    const timeSlider = d3.select("#timeSlider");
    timeSlider.on("input", function() {
      const delay = 500;
      const sliderValue = +this.value;
      const date = getDateFromSlider(sliderValue);  // Compute date from slider value
      const topN = +d3.select("#topN").node().value;
      const gender = d3.select("#gender").node().value;
      const discipline = d3.select("#discipline").node().value;
  
     
      updateChart(date, topN * 2, gender, discipline, delay);
    });
  });
  
  // Function to get the most recent Elo ratings up to a specific date
  function getTopAthletesUpToDate(data, currentDate, topN, gender, discipline) {
    // Filter for the gender and discipline
    let filteredData = data.filter(d => {
      return d.date <= currentDate &&  
             (d.gender === gender) &&  
             (d.discipline === discipline); 
    });
  
    
    const mostRecentElo = {};
    filteredData.forEach(d => {
      if (!mostRecentElo[d.athlete_name] || d.date > mostRecentElo[d.athlete_name].date) {
        mostRecentElo[d.athlete_name] = d;
      }
    });
  
    // Convert the result into an array and sort by Elo rating in descending order
    const topAthletes = Object.values(mostRecentElo).sort((a, b) => b.elo_rating - a.elo_rating);

    return topAthletes.slice(0, topN);
  }

  function getFlagEmoji(countryCode) {
    const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  }


  function updateChart(currentDate, topN, gender, discipline, delay) {
    
    const topAthletes = getTopAthletesUpToDate(window.fullEloData, currentDate, topN, gender, discipline);
  
    const barHeight = 30; 
    const svgHeight = Math.max(60, barHeight * topN); 
    const svg = d3.select("#eloChart").attr("height", svgHeight);
    const width = +svg.attr("width");
  
    // Set up the x and y scales
    const xScale = d3.scaleLinear()
                     .domain([d3.min(topAthletes, d => d.elo_rating), d3.max(topAthletes, d => d.elo_rating)])
                     .range([0, width]);
    
    
    svg.select(".x-axis").remove();
                 
    const xAxis = d3.axisTop(xScale);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0, 25)") 
        .call(xAxis);
      
  
    const yScale = d3.scaleBand()
                     .domain(topAthletes.map(d => d.athlete_name))
                     .range([20, svgHeight])
                     .padding(0); 
  
 
    const bars = svg.selectAll(".bar").data(topAthletes, d => d.athlete_name);
  
    bars.exit().remove();
  
    const barEnter = bars.enter()
        .append("g")
        .attr("class", "bar");

    // mappings for country codes to emoji flags (thanks chat GPT. And IFSC yall better start using ISO 3166-1 alpha-3 because wtf are these codes)
    const countryToEmoji = {
        'GER': 'DE', 'RUS': 'RU', 'GRE': 'GR', 'SUI': 'CH', 'BEL': 'BE', 
        'FRA': 'FR', 'LUX': 'LU', 'GBR': 'GB', 'RSA': 'ZA', 'ESP': 'ES', 
        'ITA': 'IT', 'SLO': 'SI', 'AUT': 'AT', 'CZE': 'CZ', 'UKR': 'UA', 
        'CAN': 'CA', 'USA': 'US', 'KOR': 'KR', 'CYP': 'CY', 'TPE': 'TW', 
        'HUN': 'HU', 'HKG': 'HK', 'JPN': 'JP', 'BUL': 'BG', 'GEO': 'GE', 
        'AUS': 'AU', 'IRL': 'IE', 'IND': 'IN', 'SWE': 'SE', 'ROU': 'RO', 
        'SVK': 'SK', 'FIN': 'FI', 'POL': 'PL', 'CHN': 'CN', 'CRO': 'HR', 
        'NOR': 'NO', 'BRA': 'BR', 'ARG': 'AR', 'VEN': 'VE', 'MKD': 'MK', 
        'ECU': 'EC', 'INA': 'ID', 'MAS': 'MY', 'KAZ': 'KZ', 'BLR': 'BY', 
        'IRI': 'IR', 'NED': 'NL', 'SGP': 'SG', 'MGL': 'MN', 'NZL': 'NZ', 
        'POR': 'PT', 'PHI': 'PH', 'SRB': 'RS', 'DEN': 'DK', 'CHI': 'CL', 
        'THA': 'TH', 'ISR': 'IL', 'TUR': 'TR', 'UZB': 'UZ', 'KGZ': 'KG', 
        'LAT': 'LV', 'NEP': 'NP', 'GUA': 'GT', 'MEX': 'MX', 'COL': 'CO', 
        'PAK': 'PK', 'LTU': 'LT', 'AZE': 'AZ', 'PER': 'PE', 'EST': 'EE', 
        'MAC': 'MO', 'BOT': 'BW', 'BRU': 'BN', 'CAM': 'KH', 'SRI': 'LK', 
        'CRC': 'CR', 'AND': 'AD', 'HON': 'HN', 'JOR': 'JO', 'IRQ': 'IQ', 
        'LBN': 'LB', 'ISL': 'IS', 'BIH': 'BA', 'ESA': 'SV', 'BOL': 'BO', 
        'UGA': 'UG', 'PUR': 'PR', 'MRI': 'MU', 'KUW': 'KW', 'KSA': 'SA', 
        'GUM': 'GU', 'NGR': 'NG', 'MAR': 'MA', 'FIJ': 'FJ', 'CMR': 'CM'
    };

    const colorScale = d3.scaleOrdinal()
        .domain(topAthletes.map(d => d.athlete_name))  // Use athlete names as the domain
        .range(d3.schemeObservable10);

    
    barEnter.append("rect")
            .attr("x", 0)
            .attr("y", d => yScale(d.athlete_name))
            .attr("width", 0)  // Start width at 0 for smooth transitions
            .attr("height", yScale.bandwidth())  // Use yScale.bandwidth() for consistent height
            .attr("fill", d => colorScale(d.athlete_name));

    barEnter.append("text")
            .attr("x", d => xScale(d.elo_rating) - 10)
            .attr("y", d => yScale(d.athlete_name) + yScale.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("fill", "white")
            .attr("text-anchor", "end")
            .text(d => `${d.athlete_name} ${getFlagEmoji(countryToEmoji[d.country])}`);
//            .text(d => d.athlete_name);
  
    const barUpdate = barEnter.merge(bars);
  
    // Update existing and newly entered bars
    barUpdate.transition()
        .duration(delay)
        .ease(d3.easeLinear)
        .select("rect")
        .attr("width", d => xScale(d.elo_rating))  
        .attr("y", d => yScale(d.athlete_name))    
        .attr("fill", d => colorScale(d.athlete_name))
        .attr("height", yScale.bandwidth());       

    
    // Update text labels for both new and existing bars
    barUpdate.select("text")
        .transition()
        .duration(delay)
        .delay((d, i) => i * 20)
        .attr("x", d => xScale(d.elo_rating) - 10)
        .attr("y", d => yScale(d.athlete_name) + yScale.bandwidth() / 2)
        .text(d => `${d.athlete_name} ${getFlagEmoji(countryToEmoji[d.country])}`);
        //.text(d => d.athlete_name);
  
    // Also handle the update for y-axis labels in case they change positions
    svg.selectAll(".bar")
       .attr("transform", d => `translate(0, ${yScale(d.athlete_name)})`);
}

    let isPlaying = false;  // Track if the slider is currently playing
    let playInterval;  // Variable to hold the interval

    // Play button logic
    d3.select("#playButton").on("click", function() {
    if (isPlaying) {
        // If playing, pause the slider
        clearInterval(playInterval);  
        d3.select(this).text("▶️"); 
    } else {
        // If paused, start playing
        d3.select(this).text("⏸️");  
        playSlider();  
    }
    isPlaying = !isPlaying; 
    });

    // Function to play the slider
    function playSlider() {
    const timeSlider = d3.select("#timeSlider").node();
    playInterval = setInterval(function() {
        let sliderValue = +timeSlider.value;
        const maxValue = +timeSlider.max;

        // Increment the slider if it's not at the end
        if (sliderValue < maxValue) {
        timeSlider.value = sliderValue + 1;
        timeSlider.delay = 50;
        timeSlider.dispatchEvent(new Event('input'));  
        } else {
        clearInterval(playInterval);  // Stop playing when the slider reaches the end
        d3.select("#playButton").text("▶️ Play");  
        isPlaying = false;  
        }
    }, 400);  
    }

  
  // Function to calculate the current date from the slider value
  function getDateFromSlider(sliderValue) {
    const startDate = new Date(d3.select("#startDate").node().value);
    const endDate = new Date(d3.select("#endDate").node().value);
  
    const timeRange = endDate.getTime() - startDate.getTime();
  
    const currentDate = new Date(startDate.getTime() + (sliderValue / 100) * timeRange);
  
    return currentDate;
  }
  