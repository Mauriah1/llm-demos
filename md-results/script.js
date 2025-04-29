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

    // Populate county dropdown
    const countyDropdown = document.getElementById('county-dropdown');
    data.sort((a, b) => a.jurisdiction.localeCompare(b.jurisdiction));
    
    data.forEach(county => {
        const option = document.createElement('option');
        option.value = county.jurisdiction;
        option.textContent = county.jurisdiction;
        countyDropdown.appendChild(option);
    });

    // Display statewide results
    displayResults(statewideTotals, 'statewide-totals', 'statewide-chart');

    // County dropdown change handler
    countyDropdown.addEventListener('change', function() {
        const selectedCounty = this.value;
        const countyData = data.find(county => county.jurisdiction === selectedCounty);
        
        if (countyData) {
            document.getElementById('county-name').textContent = `${selectedCounty} County Results`;
            displayResults(countyData, 'county-totals', 'county-chart');
        }
    });

    // Trigger initial county display
    if (countyDropdown.options.length > 0) {
        countyDropdown.selectedIndex = 0;
        countyDropdown.dispatchEvent(new Event('change'));
    }

    // View toggle buttons
    document.getElementById('statewide-btn').addEventListener('click', function() {
        document.getElementById('statewide-view').classList.remove('hidden');
        document.getElementById('county-view').classList.add('hidden');
        document.getElementById('statewide-btn').classList.add('active');
        document.getElementById('county-btn').classList.remove('active');
    });

    document.getElementById('county-btn').addEventListener('click', function() {
        document.getElementById('county-view').classList.remove('hidden');
        document.getElementById('statewide-view').classList.add('hidden');
        document.getElementById('county-btn').classList.add('active');
        document.getElementById('statewide-btn').classList.remove('active');
    });

    // Function to display results for a given data set
    function displayResults(resultData, totalsElementId, chartElementId) {
        const totalsElement = document.getElementById(totalsElementId);
        const chartElement = document.getElementById(chartElementId);
        
        // Clear previous content
        totalsElement.innerHTML = '';
        chartElement.innerHTML = '';
        
        // Create table for results
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        
        // Create header row
        const headerRow = document.createElement('tr');
        ['Candidate', 'Votes', 'Percentage'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create rows for each candidate
        const candidateKeys = ['harris', 'trump', 'oliver', 'stein', 'kennedy', 'others'];
        
        candidateKeys.forEach(key => {
            if (key !== 'total' && key !== 'jurisdiction') {
                const row = document.createElement('tr');
                
                // Candidate name
                const nameCell = document.createElement('td');
                nameCell.textContent = candidateNames[key];
                row.appendChild(nameCell);
                
                // Votes
                const votesCell = document.createElement('td');
                votesCell.textContent = resultData[key].toLocaleString();
                row.appendChild(votesCell);
                
                // Percentage
                const percentage = (resultData[key] / resultData.total * 100).toFixed(2);
                const percentageCell = document.createElement('td');
                percentageCell.textContent = `${percentage}%`;
                row.appendChild(percentageCell);
                
                tbody.appendChild(row);
            }
        });
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.classList.add('total-row');
        
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total';
        totalRow.appendChild(totalLabelCell);
        
        const totalVotesCell = document.createElement('td');
        totalVotesCell.textContent = resultData.total.toLocaleString();
        totalRow.appendChild(totalVotesCell);
        
        const totalPercentCell = document.createElement('td');
        totalPercentCell.textContent = '100.00%';
        totalRow.appendChild(totalPercentCell);
        
        tbody.appendChild(totalRow);
        table.appendChild(tbody);
        totalsElement.appendChild(table);
        
        // Create bar chart
        const chartContainer = document.createElement('div');
        chartContainer.classList.add('bar-chart');
        
        candidateKeys.forEach(key => {
            if (key !== 'total' && key !== 'jurisdiction') {
                const percentage = (resultData[key] / resultData.total * 100).toFixed(2);
                
                const barContainer = document.createElement('div');
                barContainer.classList.add('bar-container');
                
                const label = document.createElement('div');
                label.classList.add('bar-label');
                label.textContent = candidateNames[key];
                barContainer.appendChild(label);
                
                const barWrapper = document.createElement('div');
                barWrapper.classList.add('bar-wrapper');
                
                const bar = document.createElement('div');
                bar.classList.add('bar');
                bar.style.width = `${percentage}%`;
                bar.style.backgroundColor = colors[key];
                barWrapper.appendChild(bar);
                
                const percentLabel = document.createElement('div');
                percentLabel.classList.add('percent-label');
                percentLabel.textContent = `${percentage}%`;
                barWrapper.appendChild(percentLabel);
                
                barContainer.appendChild(barWrapper);
                chartContainer.appendChild(barContainer);
            }
        });
        
        chartElement.appendChild(chartContainer);
    }
});

