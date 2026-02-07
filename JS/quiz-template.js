// Get quiz ID from URL
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('quizId');

// Function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to create question with shuffled options
function createQuestionWithShuffledOptions(q) {
    const correctAnswer = q.correct;
    const shuffledOptions = shuffleArray(q.options);
    const correctOptionIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
        question: q.question,
        optionA: shuffledOptions[0],
        optionB: shuffledOptions[1],
        optionC: shuffledOptions[2],
        optionD: shuffledOptions[3],
        correctOption: `option${String.fromCharCode(65 + correctOptionIndex)}` // A, B, C, D
    };
}

let questions = [];
let totalQuestions = 0;

function initQuiz() {
    if (quizId && quizData[quizId]) {
        const quiz = quizData[quizId];
        questions = quiz.questions.map((q, index) => createQuestionWithShuffledOptions(q));
        totalQuestions = questions.length;
        document.getElementById('total-score').textContent = totalQuestions;
        document.getElementById('total-questions-display').textContent = totalQuestions;
        document.getElementById('total-questions').textContent = totalQuestions;
        document.getElementById('quiz-title').textContent = quiz.title;
    } else {
        // Fallback or error
        questions = [];
        document.getElementById('quiz-title').textContent = 'Quiz Not Found';
    }
    NextQuestion(0);
}

let shuffledQuestions = [] //empty array to hold shuffled selected questions out of all available questions

function handleQuestions() {
    //function to shuffle and push all questions to shuffledQuestions array
    shuffledQuestions = [...questions];
}


let questionNumber = 1 //holds the current question number
let playerScore = 0  //holds the player score
let wrongAttempt = 0 //amount of wrong answers picked by player
let indexNumber = 0 //will be used in displaying next question

// function for displaying next question in the array to dom
//also handles displaying players and quiz information to dom
function NextQuestion(index) {
    handleQuestions()
    const currentQuestion = shuffledQuestions[index]
    document.getElementById("question-number").innerHTML = questionNumber
    document.getElementById("player-score").innerHTML = playerScore
    document.getElementById("display-question").innerHTML = currentQuestion.question;
    document.getElementById("option-one-label").innerHTML = currentQuestion.optionA;
    document.getElementById("option-two-label").innerHTML = currentQuestion.optionB;
    document.getElementById("option-three-label").innerHTML = currentQuestion.optionC;
    document.getElementById("option-four-label").innerHTML = currentQuestion.optionD;

    // Add click handlers to option labels
    document.querySelectorAll('.option').forEach(label => {
        label.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.option').forEach(l => l.classList.remove('selected'));
            // Add selected class to clicked option
            label.classList.add('selected');
            // Ensure the corresponding radio button is checked
            const inputId = label.getAttribute('for');
            if (inputId) {
                document.getElementById(inputId).checked = true;
            }
        });
    });
}


function checkForAnswer() {
    const currentQuestion = shuffledQuestions[indexNumber] //gets current Question
    const currentQuestionAnswer = currentQuestion.correctOption //gets current Question's answer
    const options = document.getElementsByName("option"); //gets all elements in dom with name of 'option' (in this the radio inputs)
    let correctOption = null
    let userSelectedOption = null

    options.forEach((option) => {
        if (option.value === currentQuestionAnswer) {
            //get's correct's radio input with correct answer
            correctOption = option.labels[0].id
        }
        if (option.checked) {
            userSelectedOption = option.labels[0].id
        }
    })

    //checking to make sure a radio input has been checked or an option being chosen
    if (options[0].checked === false && options[1].checked === false && options[2].checked === false && options[3].checked == false) {
        document.getElementById('option-modal').style.display = "flex"
    }

    // Remove selected class from all options before adding feedback
    options.forEach((option) => {
        if (option.labels[0]) {
            option.labels[0].classList.remove('selected');
        }
    })

    //checking if checked radio button is same as answer
    options.forEach((option) => {
        if (option.checked === true && option.value === currentQuestionAnswer) {
            // Correct answer - show green effect
            if (userSelectedOption) {
                document.getElementById(userSelectedOption).classList.add('correct');
            }
            playerScore++ //adding to player's score
            indexNumber++ //adding 1 to index so has to display next question..
            //set to delay question number till when next question loads
            setTimeout(() => {
                questionNumber++
            }, 1000)
        }

        else if (option.checked && option.value !== currentQuestionAnswer) {
            // Incorrect answer - show red effect on selected option only
            if (userSelectedOption) {
                document.getElementById(userSelectedOption).classList.add('incorrect');
            }
            wrongAttempt++ //adds 1 to wrong attempts
            indexNumber++
            //set to delay question number till when next question loads
            setTimeout(() => {
                questionNumber++
            }, 1000)
        }
    })
}



//save quiz progress to database
async function saveQuizProgress() {
    const userId = await getUserId();
    if (userId && window.supabaseClient) {
        try {
            const { error } = await window.supabaseClient
                .from('user_quiz_scores')
                .upsert({ 
                    user_id: userId, 
                    quiz_id: quizId, 
                    score: playerScore
                }, { onConflict: 'user_id,quiz_id' });
            if (error) console.error('Error saving quiz progress:', error);
        } catch (e) {
            console.error('Error saving quiz progress:', e);
        }
    }
}

//called when the next button is called
function handleNextQuestion() {
    checkForAnswer() //check if player picked right or wrong option
    unCheckRadioButtons()

    // Save progress after answering
    saveQuizProgress();

    // Show loading state
    const btn = document.querySelector('.next-btn');
    btn.disabled = true;
    btn.textContent = 'Loading...';

    //delays next question displaying for a second just for some effects so questions don't rush in on player
    setTimeout(() => {
        if (indexNumber < totalQuestions) {
//displays next question as long as index number isn't greater than total
            NextQuestion(indexNumber)
        }
        else {
            handleEndGame()//ends game if index number greater than total
        }
        resetOptionBackground()

        // Reset button
        btn.disabled = false;
        btn.textContent = 'Next Question';
    }, 1000);
}

//sets options background back to null after display the right/wrong colors
function resetOptionBackground() {
    const options = document.getElementsByName("option");
    options.forEach((option) => {
        const label = option.labels[0];
        label.classList.remove('selected', 'correct', 'incorrect');
    })
}

// unchecking all radio buttons for next question(can be done with map or foreach loop also)
function unCheckRadioButtons() {
    const options = document.getElementsByName("option");
    for (let i = 0; i < options.length; i++) {
        options[i].checked = false;
    }
}

// function for when all questions being answered
async function handleEndGame() {
    let remark = null
    let remarkColor = null

    // condition check for player remark and remark color
    if (playerScore <= Math.floor(totalQuestions * 0.3)) {
        remark = "Bad Grades, Keep Practicing."
        remarkColor = "red"
    }
    else if (playerScore > Math.floor(totalQuestions * 0.3) && playerScore < Math.floor(totalQuestions * 0.7)) {
        remark = "Average Grades, You can do better."
        remarkColor = "orange"
    }
    else if (playerScore >= Math.floor(totalQuestions * 0.7)) {
        remark = "Excellent, Keep the good work going."
        remarkColor = "green"
    }
    const playerGrade = (playerScore / totalQuestions) * 100

    //data to display to score board
    document.getElementById('remarks').innerHTML = remark
    document.getElementById('remarks').style.color = remarkColor
    document.getElementById('wrong-answers').innerHTML = wrongAttempt
    document.getElementById('right-answers').innerHTML = playerScore
    document.getElementById('score-modal').style.display = "flex"

    // Save quiz score to database (already saved by saveQuizProgress on each question)
    // This is redundant but kept for final confirmation
    const userId = await getUserId();
    if (userId && window.supabaseClient) {
        try {
            const { error } = await window.supabaseClient
                .from('user_quiz_scores')
                .upsert({ 
                    user_id: userId, 
                    quiz_id: quizId, 
                    score: playerScore
                }, { onConflict: 'user_id,quiz_id' });
            if (error) console.error('Error saving final quiz score:', error);
        } catch (e) {
            console.error('Error saving final quiz score:', e);
        }
    }

    // Mark quiz as locked in database if perfect score (100%)
    if (playerGrade === 100) {
        if (userId && window.supabaseClient) {
            try {
                const { error } = await window.supabaseClient
                    .from('user_locked_quizzes')
                    .insert([{ user_id: userId, quiz_id: quizId, locked_at: new Date().toISOString() }]);
                if (error) console.error('Error locking quiz:', error);
            } catch (e) {
                console.error('Error saving locked quiz:', e);
            }
        }
    }

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }

}

//closes score modal, resets game and reshuffles questions
function closeScoreModal() {
    questionNumber = 1
    playerScore = 0
    wrongAttempt = 0
    indexNumber = 0
    shuffledQuestions = []
    NextQuestion(indexNumber)
    document.getElementById('score-modal').style.display = "none"
}

//function to close warning modal
function closeOptionModal() {
    document.getElementById('option-modal').style.display = "none"
}