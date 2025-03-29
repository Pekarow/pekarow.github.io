let flowerDict = null; // Global variable to store flower data
let correctChain = 0;  // Tracks consecutive correct answers
let bestChain = 0;
let waiting=false;
let bestChainChoices = []
let quizz_images = []
function parseXMLToDict(filePath) {
    if (flowerDict) {
        return Promise.resolve(flowerDict); // Return cached data if available
    }

    return fetch(filePath)
        .then(response => response.text())
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            let flowers = {};

            xmlDoc.querySelectorAll("flower").forEach(flower => {
                let name = flower.getAttribute("name");
                let images = [];

                flower.querySelectorAll("image").forEach(image => {
                    images.push(image.getAttribute("url"));
                });

                flowers[name] = images;
            });

            flowerDict = flowers; // Store parsed data globally
            return flowers;
        });
}

function selectRandomFlowers(count = 3) {
    const flowerNames = Object.keys(flowerDict);
    if (flowerNames.length <= count) {
        return flowerNames.map(name => ({ name, images: flowerDict[name] }));
    }

    let selectedFlowers = [];
    let selectedIndexes = new Set();
    while (selectedIndexes.size < count) {
        let randomIndex = Math.floor(Math.random() * flowerNames.length);
        if (!selectedIndexes.has(randomIndex)) {
            selectedIndexes.add(randomIndex);
            let name = flowerNames[randomIndex];
            selectedFlowers.push({ name, images: flowerDict[name] });
        }
    }

    return selectedFlowers;
}

function populateQuiz(filePath) {
    if (waiting===true) return;
    parseXMLToDict(filePath).then(() => {
        let selectedFlowers = selectRandomFlowers();

        // Choose one of the selected flowers as the target question
        let targetFlower = selectedFlowers[Math.floor(Math.random() * selectedFlowers.length)];

        // Update the question
        let question_title = document.getElementById("question");
        question_title.innerText = `Quelle plante correspond à: `;
        let flower_span = document.createElement("p")
         
        flower_span.id = "flower_s"
        flower_span.innerHTML = `${targetFlower.name}`

        question_title.appendChild(flower_span);

        let optionsContainer = document.getElementById("options");
        optionsContainer.innerHTML = "";
        quizz_images=[];
        selectedFlowers.forEach(flower => {
            let optionDiv = document.createElement("div");
            optionDiv.className = "option";
            optionDiv.onclick = () => checkAnswer(flower.name, targetFlower.name);

            let img = document.createElement("img");
            quizz_images.push(img);
            img.src = flower.images[0]; // Use the first image
            img.alt = flower.name;

            optionDiv.appendChild(img);
            optionsContainer.appendChild(optionDiv);
        });
    });
}
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function checkAnswer(selectedName, correctName) {
    if (waiting===true) return;
    waiting=true;
    console.log(quizz_images.length)
    for (const imimage of quizz_images) 
    {
        console.log(imimage.getAttribute("alt"))
        if (imimage.getAttribute("alt")===correctName)
        {
            imimage.id = "right-answer"
        }
        else{
            imimage.id = "wrong-answer"
        }
    }
    if (selectedName === correctName) {
        bestChainChoices.push(correctName)
        correctChain++;
        if (bestChain < correctChain)
        {
            bestChain = correctChain;
        }
        document.getElementById("result").innerText = "Correct! 🎉";
        await delay(1000)
        document.getElementById("result").innerText = ""
        waiting=false;
        populateQuiz("flowers.xml");

    } else {
        bestChainChoices = [];
        correctChain = 0;
        document.getElementById("result").innerText = "Incorrect. 😢 Try again!";
        await delay(1000)
        document.getElementById("result").innerText = ""
        waiting=false;
        populateQuiz("flowers.xml");

    }
    
    document.getElementById("chain_value").innerText = `${correctChain}`;
    document.getElementById("best_chain_value").innerText = `${bestChain}`;
}

// Add event listener for button
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loadQuizButton").addEventListener("click", function() {
        populateQuiz("flowers.xml"); // Ensure this is the correct path
        document.getElementById("loadQuizButton").hidden = true;
    });
});
