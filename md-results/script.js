  document.addEventListener('DOMContentLoaded', function() {
    // Election data from CSV
    const csvData = `jurisdiction,harris,trump,oliver,stein,kennedy,others,total
Allegany,9231,22141,130,136,363,136,32137
Anne Arundel,171945,128892,2141,2429,3375,2790,311572
Baltimore City,195109,27984,892,3222,1875,1672,230754
Baltimore County,249958,149560,2240,4195,3858,3104,412915
Calvert,23438,29361,297,232,554,309,54191
Caroline,4860,11053,84,99,180,54,16330
Carroll,36867,62273,845,629,1182,855,102651
Cecil,17628,33871,291,286,536,219,52831
Charles,63454,26145,334,828,889,447,92097
Dorchester,6954,9390,57,138,191,42,16772
Frederick,82409,68753,970,1378,1494,1110,156114
Garrett,3456,11983,75,48,223,53,15838
Harford,62453,83050,1023,935,1559,1070,150090
Howard,124764,49425,1246,3341,1712,1803,182291
Kent,5251,5561,60,82,114,60,11128
Montgomery,386581,112637,2416,8009,4276,5302,519221
Prince George's,347038,45008,1038,5369,3428,2128,404009
Queen Anne's,11273,20200,174,153,336,211,32347
Saint Mary's,23531,33582,409,352,669,411,58954
Somerset,4054,5805,32,85,114,47,10137
Talbot,11119,11125,109,120,194,163,22830
Washington,27260,44054,363,513,811,331,73332
Wicomico,21513,24065,205,371,544,214,46912
Worcester,12431,19632,139,184,342,153,32881`;

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const entry = {};
        
        for (let j = 0; j < headers.length; j++) {
            entry[headers[j]] = j === 0 ? values[j] : parseInt(values[j]);
        }
        
        // Calculate additional metrics
        entry.winner = entry.harris > entry.trump ? 'harris' : 'trump';
        entry.margin = Math.abs(entry.harris - entry.trump);
        entry.marginPercent = (entry.margin / entry.total * 100).toFixed(2);
        entry.harrisPercent = (entry.harris / entry.total * 100).toFixed(2);
        entry.trumpPercent = (entry.trump / entry.total * 100).toFixed(2);
        
        data.push(entry);
    }

    // Calculate statewide totals
    const statewideTotals = {
        harris: 0,
        trump: 0,
        oliver: 0,
        stein: 0,
        kennedy: 0,
        others: 0,
        total: 0
    };

    data.forEach(county => {
        statewideTotals.harris += county.harris;
        statewideTotals.trump += county.trump;
        statewideTotals.oliver += county.oliver;
        statewideTotals.stein += county.stein;
        statewideTotals.kennedy += county.kennedy;
        statewideTotals.others += county.others;
        statewideTotals.total += county.total;
    });
    
    // Calculate additional statewide metrics
    statewideTotals.winner = statewideTotals.harris > statewideTotals.trump ? 'harris' : 'trump';
    statewideTotals.margin = Math.abs(statewideTotals.harris - statewideTotals.trump);
    statewideTotals.marginPercent = (statewideTotals.margin / statewideTotals.total * 100).toFixed(2);
    statewideTotals.harrisPercent = (statewideTotals.harris / statewideTotals.total * 100).toFixed(2);
    statewideTotals.trumpPercent = (statewideTotals.trump / statewideTotals.total * 100).toFixed(2);

    // Sort counties by total votes for ranking
    const countiesBySize = [...data].sort((a, b) => b.total - a.total);
    
    // Calculate county rankings
    data.forEach(county => {
        county.sizeRank = countiesBySize.findIndex(c => c.jurisdiction === county.jurisdiction) + 1;
    });

    // Format candidate names for display
    const candidateNames = {
        harris: "Kamala Harris",
        trump: "Donald Trump",
        oliver: "Jill Oliver",
        stein: "Jill Stein",
        kennedy: "Robert F. Kennedy Jr.",
        others: "Others"
    };

    // Color palette for charts
    const colors = {
        harris: "#3366CC",
        trump: "#DC3912",
        oliver: "#FF9900",
        stein: "#109618",
        kennedy: "#990099",
        others: "#999999"
    };

    // Abbreviated candidate names for charts
    const shortCandidateNames = {
        harris: "Harris",
        trump: "Trump",
        oliver: "Oliver",
        stein: "Stein",
        kennedy: "Kennedy",
        others: "Others"
    };

    // Charts and visualizations
    let statewideBarChart = null;
    let statewidePieChart = null;
    let countyBarChart = null;
    let countyPieChart = null;
    let countyAChart = null;
    let countyBChart = null;

    // Populate county dropdowns
    const populateCountyDropdowns = () => {
        const countyDropdown = document.getElementById('county-dropdown');
        const countyADropdown = document.getElementById('county-a-dropdown');
        const countyBDropdown = document.getElementById('county-b-dropdown');
        
        // Clear existing options
        countyDropdown.innerHTML = '';
        countyADropdown.innerHTML = '';
        countyBDropdown.innerHTML = '';
        
        // Sort counties alphabetically
        const sortedCounties = [...data].sort((a, b) => a.jurisdiction.localeCompare(b.jurisdiction));
        
        // Add counties to dropdowns
        sortedCounties.forEach(county => {
            // Main county dropdown
            const option = document.createElement('option');
            option.value = county.jurisdiction;
            option.textContent = county.jurisdiction;
            countyDropdown.appendChild(option);
            
            // County A dropdown for comparison
            const optionA = document.createElement('option');
            optionA.value = county.jurisdiction;
            optionA.textContent = county.jurisdiction;
            countyADropdown.appendChild(optionA);
            
            // County B dropdown for comparison
            const optionB = document.createElement('option');
            optionB.value = county.jurisdiction;
            optionB.textContent = county.jurisdiction;
            countyBDropdown.appendChild(optionB);
        });
    };

    // Initialize statewide view
    const initStatewide = () => {
        // Update stat cards
        document.getElementById('total-votes').textContent = statewideTotals.total.toLocaleString();
        
        const winnerName = statewideTotals.winner === 'harris' ? 'Kamala Harris' : 'Donald Trump';
        const winnerPercent = statewideTotals.winner === 'harris' ? statewideTotals.harrisPercent : statewideTotals.trumpPercent;
        document.getElementById('winner-name').textContent = winnerName;
        document.getElementById('winner-percent').textContent = `${winnerPercent}%`;
        document.getElementById('victory-margin').textContent = `${statewideTotals.marginPercent}%`;
        
        // Display results
        displayTableResults(statewideTotals, 'statewide-totals');
        createStatewidePieChart();
        createStatewideBarChart();
        
        // Hide table by default
        document.getElementById('statewide-totals').classList.add('hidden');
    };

    // Initialize county view
    const initCountyView = () => {
        // Default to first county alphabetically
        if (document.getElementById('county-dropdown').options.length > 0) {
            document.getElementById('county-dropdown').selectedIndex = 0;
            updateCountyView();
        }
    };

    // Create and initialize map view
    const initMapView = () => {
        createMarylandMap();
    };

    // Initialize comparison view
    const initCompareView = () => {
        // Default to first two counties alphabetically
        if (document.getElementById('county-a-dropdown').options.length > 1) {
            document.getElementById('county-a-dropdown').selectedIndex = 0;
            document.getElementById('county-b-dropdown').selectedIndex = 1;
            updateComparisonView();
        }
    };

    // Create a simple Maryland map with county shapes
    const createMarylandMap = () => {
        const mapContainer = document.getElementById('md-map');
        mapContainer.innerHTML = '';
        
        // SVG for Maryland map - simplified for this demo
        const svgContainer = document.createElement('div');
        svgContainer.innerHTML = `
            <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                <g id="md-counties"></g>
            </svg>
        `;
        mapContainer.appendChild(svgContainer);
        
        // Simple county representations
        const countyShapes = {
            'Allegany': 'M50,100 H150 V150 H50 Z',
            'Anne Arundel': 'M400,300 H500 V400 H400 Z',
            'Baltimore City': 'M350,250 H400 V300 H350 Z',
            'Baltimore County': 'M300,200 H400 V250 H350 V300 H300 Z',
            'Calvert': 'M450,450 H500 V550 H450 Z',
            'Caroline': 'M650,250 H700 V350 H650 Z',
            'Carroll': 'M250,150 H350 V250 H300 V200 H250 Z',
            'Cecil': 'M600,100 H700 V200 H600 Z',
            'Charles': 'M350,450 H450 V550 H350 Z',
            'Dorchester': 'M600,350 H700 V450 H600 Z',
            'Frederick': 'M200,100 H300 V200 H250 V150 H200 Z',
            'Garrett': 'M50,50 H150 V100 H50 Z',
            'Harford': 'M500,100 H600 V200 H500 Z',
            'Howard': 'M350,200 H450 V300 H400 V250 H350 Z',
            'Kent': 'M550,150 H650 V250 H550 Z',
            'Montgomery': 'M200,200 H300 V300 H200 Z',
            'Prince George\'s': 'M300,300 H400 V400 H300 Z',
            'Queen Anne\'s': 'M550,250 H650 V350 H550 Z',
            'Saint Mary\'s': 'M350,550 H450 V600 H350 Z',
            'Somerset': 'M550,450 H650 V550 H550 Z',
            'Talbot': 'M600,250 H650 V350 H600 Z',
            'Washington': 'M150,100 H200 V200 H150 Z',
            'Wicomico': 'M550,350 H650 V450 H550 Z',
            'Worcester': 'M650,350 H750 V550 H650 Z'
        };
        
        const countiesGroup = svgContainer.querySelector('#md-counties');
        
        // Create shapes for each county
        data.forEach(county => {
            if (countyShapes[county.jurisdiction]) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", countyShapes[county.jurisdiction]);
                path.classList.add("county-shape");
                
                // Color based on winner
                const winnerColor = county.winner === 'harris' ? 'var(--harris-color)' : 'var(--trump-color)';
                path.style.fill = winnerColor;
                
                // Add data attributes
                path.dataset.county = county.jurisdiction;
                path.dataset.winner = county.winner;
                
                // Add interaction
                path.addEventListener('click', () => {
                    // Update selected county in dropdown and view
                    document.getElementById('county-dropdown').value = county.jurisdiction;
                    displayCountyMapInfo(county);
                    
                    // Update visual selection
                    document.querySelectorAll('.county-shape.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    path.classList.add('selected');
                });
                
                countiesGroup.appendChild(path);
            }
        });
        
        // Add county labels
        data.forEach(county => {
            if (countyShapes[county.jurisdiction]) {
                // Extract center coordinates from path
                const pathString = countyShapes[county.jurisdiction];
                const coords = pathString.match(/\d+/g).map(Number);
                
                // Calculate center (simplified)
                const centerX = (Math.min(...coords.filter((_, i) => i % 2 === 0)) + Math.max(...coords.filter((_, i) => i % 2 === 0))) / 2;
                const centerY = (Math.min(...coords.filter((_, i) => i % 2 === 1)) + Math.max(...coords.filter((_, i) => i % 2 === 1))) / 2;
                
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", centerX);
                text.setAttribute("y", centerY);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("font-size", "10");
                text.setAttribute("fill", "#fff");
                text.setAttribute("pointer-events", "none");
                text.textContent = county.jurisdiction.substring(0, 4); // Abbreviated name
                
                countiesGroup.appendChild(text);
            }
        });
    };

    // Display county info in the map panel
    const displayCountyMapInfo = (county) => {
        const infoPanel = document.getElementById('map-county-details');
        
        const harrisPct = (county.harris / county.total * 100).toFixed(1);
        const trumpPct = (county.trump / county.total * 100).toFixed(1);
        const marginPct = (Math.abs(county.harris - county.trump) / county.total * 100).toFixed(1);
        
        infoPanel.innerHTML = `
            <h3>${county.jurisdiction} County</h3>
            <div class="county-result-summary">
                <p><strong>Winner:</strong> ${county.winner === 'harris' ? 'Kamala Harris' : 'Donald Trump'}</p>
                <p><strong>Margin:</strong> ${marginPct}%</p>
                <p><strong>Total Votes:</strong> ${county.total.toLocaleString()}</p>
            </div>
            <div class="county-map-details">
                <div class="result-bar">
                    <div class="result-label">Harris: ${harrisPct}%</div>
                    <div class="result-bar-wrapper">
                        <div class="result-bar-fill harris-color" style="width: ${harrisPct}%"></div>
                    </div>
                </div>
                <div class="result-bar">
                    <div class="result-label">Trump: ${trumpPct}%</div>
                    <div class="result-bar-wrapper">
                        <div class="result-bar-fill trump-color" style="width: ${trumpPct}%"></div>
                    </div>
                </div>
                <div class="county-map-stats">
                    <p>Harris: ${county.harris.toLocaleString()} votes</p>
                    <p>Trump: ${county.trump.toLocaleString()} votes</p>
                    <p>Others: ${(county.total - county.harris - county.trump).toLocaleString()} votes</p>
                </div>
            </div>
        `;
    };

    // Update county view based on dropdown selection
    const updateCountyView = () => {
        const selectedCounty = document.getElementById('county-dropdown').value;
        const countyData = data.find(county => county.jurisdiction === selectedCounty);
        
        if (countyData) {
            // Update county name
            document.getElementById('county-name').textContent = `${selectedCounty} County Results`;
            
            // Update stat cards
            document.getElementById('county-total-votes').textContent = countyData.total.toLocaleString();
            document.getElementById('county-turnout-rank').textContent = `#${countyData.sizeRank} of 24`;
            
            // Display results
            displayTableResults(countyData, 'county-totals');
            createCountyPieChart(countyData);
            createCountyBarChart(countyData);
            
            // Hide table by default
            document.getElementById('county-totals').classList.add('hidden');
        }
    };

    // Update comparison view
    const updateComparisonView = () => {
        const countyAName = document.getElementById('county-a-dropdown').value;
        const countyBName = document.getElementById('county-b-dropdown').value;
        
        const countyA = data.find(county => county.jurisdiction === countyAName);
        const countyB = data.find(county => county.jurisdiction === countyBName);
        
        if (countyA && countyB) {
            // Update county names
            document.getElementById('county-a-name').textContent = `${countyAName} County`;
            document.getElementById('county-b-name').textContent = `${countyBName} County`;
            
            // Display county A stats
            document.getElementById('county-a-stats').innerHTML = `
                <div class="stat-card">
                    <div class="stat-title">Total Votes</div>
                    <div class="stat-value">${countyA.total.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">${countyA.winner === 'harris' ? 'Harris' : 'Trump'} Won</div>
                    <div class="stat-value">${countyA.marginPercent}%</div>
                </div>
            `;
            
            // Display county B stats
            document.getElementById('county-b-stats').innerHTML = `
                <div class="stat-card">
                    <div class="stat-title">Total Votes</div>
                    <div class="stat-value">${countyB.total.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">${countyB.winner === 'harris' ? 'Harris' : 'Trump'} Won</div>
                    <div class="stat-value">${countyB.marginPercent}%</div>
                </div>
            `;
            
            // Create comparison charts
            createCountyComparisonCharts(countyA, countyB);
            
            // Create comparison metrics table
            createComparisonTable(countyA, countyB);
        }
    };

    // Create comparison metrics table
    const createComparisonTable = (countyA, countyB) => {
        const table = document.getElementById('comparison-table');
        
        table.innerHTML = `
            <tr>
                <th>Metric</th>
                <th>${countyA.jurisdiction}</th>
                <th>${countyB.jurisdiction}</th>
                <th>Difference</th>
            </tr>
            <tr>
                <td>Harris Votes</td>
                <td>${countyA.harris.toLocaleString()}</td>
                <td>${countyB.harris.toLocaleString()}</td>
                <td>${(countyA.harris - countyB.harris).toLocaleString()}</td>
            </tr>
            <tr>
                <td>Trump Votes</td>
                <td>${countyA.trump.toLocaleString()}</td>
                <td>${countyB.trump.toLocaleString()}</td>
                <td>${(countyA.trump - countyB.trump).toLocaleString()}</td>
            </tr>
            <tr>
                <td>Total Votes</td>
                <td>${countyA.total.toLocaleString()}</td>
                <td>${countyB.total.toLocaleString()}</td>
                <td>${(countyA.total - countyB.total).toLocaleString()}</td>
            </tr>
            <tr>
                <td>Harris %</td>
                <td>${countyA.harrisPercent}%</td>
                <td>${countyB.harrisPercent}%</td>
                <td>${(countyA.harrisPercent - countyB.harrisPercent).toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Trump %</td>
                <td>${countyA.trumpPercent}%</td>
                <td>${countyB.trumpPercent}%</td>
                <td>${(countyA.trumpPercent - countyB.trumpPercent).toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Victory Margin</td>
                <td>${countyA.marginPercent}%</td>
                <td>${countyB.marginPercent}%</td>
                <td>${(countyA.marginPercent - countyB.marginPercent).toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Third Party %</td>
                <td>${(100 - countyA.harrisPercent - countyA.trumpPercent).toFixed(2)}%</td>
                <td>${(100 - countyB.harrisPercent - countyB.trumpPercent).toFixed(2)}%</td>
                <td>${((100 - countyA.harrisPercent - countyA.trumpPercent) - (100 - countyB.harrisPercent - countyB.trumpPercent)).toFixed(2)}%</td>
            </tr>
        `;
    };

    // Display table results
    const displayTableResults = (resultData, elementId) => {
        const element = document.getElementById(elementId);
        
        // Create table for results
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Votes</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(candidateNames).map(key => {
                        if (key !== 'total' && resultData[key]) {
                            const percentage = (resultData[key] / resultData.total * 100).toFixed(2);
                            return `
                                <tr>
                                    <td>${candidateNames[key]}</td>
                                    <td>${resultData[key].toLocaleString()}</td>
                                    <td>${percentage}%</td>
                                </tr>
                            `;
                        }
                        return '';
                    }).join('')}
                    <tr class="total-row">
                        <td>Total</td>
                        <td>${resultData.total.toLocaleString()}</td>
                        <td>100.00%</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        element.innerHTML = tableHTML;
    };

    // Create statewide bar chart
    const createStatewideBarChart = () => {
        if (statewideBarChart) {
            statewideBarChart.destroy();
        }
        
        const ctx = document.getElementById('statewide-chart-canvas').getContext('2d');
        
        const candidateKeys = ['harris', 'trump', 'oliver', 'stein', 'kennedy', 'others'];
        const chartLabels = candidateKeys.map(key => shortCandidateNames[key]);
        const chartData = candidateKeys.map(key => statewideTotals[key]);
        const chartColors = candidateKeys.map(key => colors[key]);
        
        statewideBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Votes',
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / statewideTotals.total * 100).toFixed(2);
                                return `${value.toLocaleString()} votes (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });
    };

    // Create statewide pie chart
    const createStatewidePieChart = () => {
        if (statewidePieChart) {
            statewidePieChart.destroy();
        }
        
        const ctx = document.getElementById('statewide-chart-canvas').getContext('2d');
        
        const candidateKeys = ['harris', 'trump', 'oliver', 'stein', 'kennedy', 'others'];
        const chartLabels = candidateKeys.map(key => candidateNames[key]);
        const chartData = candidateKeys.map(key => statewideTotals[key]);
        const chartColors = candidateKeys.map(key => colors[key]);
        
        statewidePieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / statewideTotals.total * 100).toFixed(2);
                                return `${context.label}: ${value.toLocaleString()} votes (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    };

    // Create county bar chart
    const createCountyBarChart = (countyData) => {
        if (countyBarChart) {
            countyBarChart.destroy();
        }
        
        const ctx = document.getElementById('county-chart-canvas').getContext('2d');
        
        const candidateKeys = ['harris', 'trump', 'oliver', 'stein', 'kennedy', 'others'];
        const chartLabels = candidateKeys.map(key => shortCandidateNames[key]);
        const chartData = candidateKeys.map(key => countyData[key]);
        const chartColors = candidateKeys.map(key => colors[key]);
        
        countyBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Votes',
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = (value / countyData.total * 100).toFixed(2);
                                return `${value.toLocaleString()} votes (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });
    };

    // Create county pie chart
    const createCountyPieChart = (countyData) => {
        if (countyPieChart) {
            countyPieChart.destroy();
        }
        
        const ctx = document.getElementById('county-chart-canvas').getContext('2d');
        
        const candidateKeys = ['harris', 'trump', 'oliver', 'stein', 'kennedy', 'others'];
        const chartLabels = candidateKeys.map(key => candidateNames[key]);
        const chartData = candidateKeys.map(key => countyData[key]);
        const chartColors = candidateKeys.map(key => colors[key]);
        
        countyPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspect