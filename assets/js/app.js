// Create SVG space dimensions
var svgWidth = 800;
var svgHeight = 500;

//Create SVG margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

//Create SVG final size area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(healthRisk, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthRisk, d => d[chosenXAxis]) * 0.8,
      d3.max(healthRisk, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(healthRisk, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthRisk, d => d[chosenYAxis]) * 0.8,
      d3.max(healthRisk, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
  return yLinearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));    

  return circlesGroup;
}

// Function used for updating text group with a transition to
// new text
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))
    .attr("text-anchor", "middle");
  
  return textGroup;
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

  //var xlabel;

  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Age (Median)";
  }

  else{
    var xlabel = "Household Income (Median)";
  }

  // var ylabel;

  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare (%)";
  }

  else if (chosenYAxis === "obesity") {
    var ylabel = "Obese (%)";
  }

  else{
    var ylabel = "Smokes (%)";
  }

// Initialize tooltips
  var toolTip = d3.tip()
    .attr("class", "tooltip d3-tip")
    .offset([100, -10])
    .html(function(d) {
      return (`<strong>${d.state}</strong><br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });
  
  // Create the circle tooltips
  circlesGroup.call(toolTip);

  // On mouseover event
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // On mouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });
  
  //Create the text tooltips
  textGroup.call(toolTip);

  // On mouseover event
  textGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })

    // On mouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data)
    });  

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/healthRisk.csv").then(function(healthRisk, err) {
  if (err) throw err;

  // Parse data
  healthRisk.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // Create xLinearScale & yLinearScale functions
  var xLinearScale = xScale(healthRisk, chosenXAxis);
  var yLinearScale = yScale(healthRisk, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Append initial circles
  var circlesGroup = chartGroup.selectAll(".stateCircle")
    .data(healthRisk)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("class", "stateCircle")
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");

// Append text to circles
  var textGroup = chartGroup.selectAll(".stateText")
    .data(healthRisk)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]*.98))
    .text(d => (d.abbr))
    .attr("class", "stateText")
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("fill", "white");

  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");


// Create group for three y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(-25, ${height / 2})`);
     
  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -30)
    .attr("x", 0)
    .attr("value", "healthcare")
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");
  
  var smokesLabel = ylabelsGroup.append("text") 
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", 0)
    .attr("value", "smokes")
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes (%)");
  
  var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -70)
    .attr("x", 0)
    .attr("value", "obesity")
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Obese (%)");

  // updateToolTip function
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

  // X axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // Replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // Updates x scale for new data
        xLinearScale = xScale(healthRisk, chosenXAxis);

        // Updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // Updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Updates text with new values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        // Changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else{
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // Y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // Replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis)

        // Updates y scale for new data
        yLinearScale = yScale(healthRisk, chosenYAxis);

        // Updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // Updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Updates text with new values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        // Changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else{
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

}).catch(function(error) {
  console.log(error);
});
