
        
const teams = [
    'Chennai Super Kings',
    'Delhi Capitals',
    'Kolkata Knight Riders',
    'Mumbai Indians',
    'Rising Pune Super Gaints',
    'Rajasthan Royals',
    'Royal Challengers Bangalore',
    'Sunrisers Hyderabad',
    'Kings XI Punjab'
];

const cities = [
    'Bengaluru-Chinnaswamy',
    'Chennai-Chepauk',
    'Delhi-Arun Jaitley',
    'Hyderabad-Rajiv Gandhi',
    'Kolkata-Eden Gardens',
    'Mumbai-Wankhede',
    'Jaipur-Sawai Mansingh',
    'Mohali- MCA',
    'Pune - Subrata Roy Sahara Stadium',
    'Dubai-Dubai international Stadium',
    'Abu Dhabi- Abu dhabi cricket ground'
];
const teamStrength = {
    'Chennai Super Kings': 90,
    'Delhi Capitals': 75,
    'Gujarat Titans': 78,
    'Kolkata Knight Riders': 77,
    'Mumbai Indians': 82,
    'Rajasthan Royals': 72,
    'Royal Challengers Bangalore': 76,
    'Sunrisers Hyderabad': 71,
    'Rising Pune Super Gaints': 78,
    'Kings XI Punjab': 60
};


const homeAdvantage = {
    'Chennai Super Kings': ['Chennai-Chepauk'],
    'Delhi Capitals': ['Delhi-Arun Jaitley'],
    'Kolkata Knight Riders': ['Kolkata-Eden Gardens'],
    'Mumbai Indians': ['Mumbai-Wankhede'],
    'Rising Pune Super Gaints':['Subrata Roy Sahara Stadium'],
    'Kings XI Punjab': ['Mohali- MCA'],
    'Rajasthan Royals': ['Jaipur-Sawai Mansingh'],
    'Royal Challengers Bangalore': ['Bengaluru-Chinnaswamy'],
    'Sunrisers Hyderabad': ['Hyderabad'],
};
const data = document.getElementById('ipl.pynb')
const pipefile = document.getElementById('pipe.pkl')
const battingTeamSelect = document.getElementById('batting-team');
const bowlingTeamSelect = document.getElementById('bowling-team');
const citySelect = document.getElementById('city');
const targetInput = document.getElementById('target');
const scoreInput = document.getElementById('score');
const wicketsInput = document.getElementById('wickets');
const oversInput = document.getElementById('overs');
const predictBtn = document.getElementById('predict-btn');
const battingTeamName = document.getElementById('batting-team-name');
const bowlingTeamName = document.getElementById('bowling-team-name');
const battingWinProb = document.getElementById('batting-win-prob');
const bowlingWinProb = document.getElementById('bowling-win-prob');
const battingTeamCard = document.getElementById('batting-team-card');
const bowlingTeamCard = document.getElementById('bowling-team-card');
const probabilityFill = document.getElementById('probability-fill');

// Initialize selects
function populateSelect(selectElement, options, defaultValue) {
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
    selectElement.value = defaultValue;
}

populateSelect(battingTeamSelect, teams, 'Delhi Capitals');
populateSelect(bowlingTeamSelect, teams, 'Kings XI Punjab');
populateSelect(citySelect, cities, 'Ahmedabad');

// Helper functions
function increment(inputElement, value, max = 1000) {
    const currentValue = parseInt(inputElement.value) || 0;
    inputElement.value = Math.min(max, currentValue + value);
}

function decrement(inputElement, value, min = 0) {
    const currentValue = parseInt(inputElement.value) || 0;
    inputElement.value = Math.max(min, currentValue - value);
}

// Add event listeners for increment/decrement buttons
document.getElementById('target-plus').addEventListener('click', () => increment(targetInput, 1));
document.getElementById('target-minus').addEventListener('click', () => decrement(targetInput, 1));
document.getElementById('score-plus').addEventListener('click', () => increment(scoreInput, 1));
document.getElementById('score-minus').addEventListener('click', () => decrement(scoreInput, 1));
document.getElementById('wickets-plus').addEventListener('click', () => increment(wicketsInput, 1, 10));
document.getElementById('wickets-minus').addEventListener('click', () => decrement(wicketsInput, 1));
document.getElementById('overs-plus').addEventListener('click', () => increment(oversInput, 1, 20));
document.getElementById('overs-minus').addEventListener('click', () => decrement(oversInput, 1));

// Prediction logic
function predictProbability() {
    const battingTeam = battingTeamSelect.value;
    const bowlingTeam = bowlingTeamSelect.value;
    const city = citySelect.value;
    const target = parseInt(targetInput.value) || 0;
    const score = parseInt(scoreInput.value) || 0;
    const wickets = parseInt(wicketsInput.value) || 0;
    const overs = parseInt(oversInput.value) || 0;

    // Deterministic prediction logic
    const runsLeft = target - score;
    const ballsLeft = Math.max(0, 120 - overs * 6);
    const wicketsLeft = 10 - wickets;
    
    // Base win probability calculation
    const runRate = ballsLeft > 0 ? (runsLeft * 6) / ballsLeft : 99;
    let battingTeamProb = 50;
    
    // Factor 1: Required Run Rate adjustment
    if (runRate <= 6) battingTeamProb += 25;
    else if (runRate <= 8) battingTeamProb += 15;
    else if (runRate <= 10) battingTeamProb += 5;
    else if (runRate <= 12) battingTeamProb -= 10;
    else if (runRate <= 15) battingTeamProb -= 20;
    else battingTeamProb -= 30;
    
    // Factor 2: Wickets adjustment - More nuanced approach
    if (wicketsLeft >= 9) battingTeamProb += 15;
    else if (wicketsLeft >= 7) battingTeamProb += 10;
    else if (wicketsLeft >= 5) battingTeamProb += 0;
    else if (wicketsLeft >= 3) battingTeamProb -= 15; // Increased penalty
    else if (wicketsLeft >= 1) battingTeamProb -= 25; // Increased penalty
    else battingTeamProb -= 40;
    
    // Add a combined factor for wickets and runs required
    const runsPerWicket = runsLeft / (wicketsLeft || 0.5); // Avoid division by zero
    if (runsPerWicket > 20) battingTeamProb -= 15;
    else if (runsPerWicket > 15) battingTeamProb -= 10;
    else if (runsPerWicket > 10) battingTeamProb -= 5;
    
    // Special case: 6 wickets down with 50+ runs needed
    if (wickets >= 6 && runsLeft > 50) {
        const difficultyFactor = Math.min(30, Math.floor(runsLeft / 10));
        battingTeamProb -= difficultyFactor;
    }
    
    // Factor 3: Team strength difference
    const strengthDiff = (teamStrength[battingTeam] - teamStrength[bowlingTeam]) / 10;
    battingTeamProb += strengthDiff;
    
    // Factor 4: Home advantage (3% boost)
    if (homeAdvantage[battingTeam]?.includes(city)) {
        battingTeamProb += 3;
    }
    if (homeAdvantage[bowlingTeam]?.includes(city)) {
        battingTeamProb -= 3;
    }
    
    // Special case: If chasing team needs 0 or fewer runs, they win
    if (runsLeft <= 0) {
        battingTeamProb = 100;
    }
                // Special case: If no balls left or no wickets, batting team loses
                if (ballsLeft <= 0 && runsLeft > 0) {
        battingTeamProb = 0;
    }
    if (wicketsLeft <= 0 && runsLeft > 0) {
        battingTeamProb = 0;
    }
    
    // Clamp probability between 0 and 100
    battingTeamProb = Math.min(100, Math.max(0, Math.round(battingTeamProb)));
    
    // Update UI with new probabilities
    battingWinProb.textContent = battingTeamProb + '%';
    bowlingWinProb.textContent = (100 - battingTeamProb) + '%';
    probabilityFill.style.width = battingTeamProb + '%';
    
    // Update team cards
    battingTeamName.textContent = battingTeam;
    bowlingTeamName.textContent = bowlingTeam;
    
    if (battingTeamProb > 50) {
        battingTeamCard.classList.add('winning-team');
        battingTeamCard.classList.remove('losing-team');
        bowlingTeamCard.classList.add('losing-team');
        bowlingTeamCard.classList.remove('winning-team');
    } else {
        battingTeamCard.classList.add('losing-team');
        battingTeamCard.classList.remove('winning-team');
        bowlingTeamCard.classList.add('winning-team');
        bowlingTeamCard.classList.remove('losing-team');
    }
}

// Add event listener for predict button
predictBtn.addEventListener('click', predictProbability);

// Initial prediction
predictProbability();
