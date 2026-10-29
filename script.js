import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyB2FlkeqOusow8qNq9-zeR7erf3kpI1gAU",
    authDomain: "smart-study-planner-5f723.firebaseapp.com",
    projectId: "smart-study-planner-5f723",
    storageBucket: "smart-study-planner-5f723.firebasestorage.app",
    messagingSenderId: "1092762116428",
    appId: "1:1092762116428:web:69ac50ece80d7da382efe9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// ===============================
// ADD NEW SUBJECT
// ===============================

const addSubjectBtn = document.getElementById("addSubjectBtn");

addSubjectBtn.addEventListener("click", async function () {

    const subjectName = prompt("📚 Enter subject name:");

    if (!subjectName || subjectName.trim() === "") {
        return;
    }

    const subject = subjectName.trim();

    try {

        // Save subject to Firebase
        const docRef = await addDoc(collection(db, "subjects"), {
            name: subject,
            createdAt: new Date().toISOString()
        });

        // Create subject card on website
        const subjectCard = document.createElement("div");
        subjectCard.className = "subject-card";

        subjectCard.innerHTML = `
            <h3>📚 ${subject}</h3>
            <p>Your study subject.</p>
            <button class="delete-subject-btn">❌ Delete</button>
`       ;
subjectCard.addEventListener("click", function () {
    openSubject(subject);
});

        // Delete subject button
        const deleteSubjectBtn =
            subjectCard.querySelector(".delete-subject-btn");

        deleteSubjectBtn.addEventListener("click", async function (event) {
            event.stopPropagation();

            const confirmDelete = confirm(
                "Are you sure you want to delete " + subject + "?"
             );

             if (!confirmDelete) {
                 return;
             }

             try {
                 await deleteDoc(doc(db, "subjects", docRef.id));

                 subjectCard.remove();

                 alert("✅ " + subject + " deleted successfully!");

            } catch (error) {
                console.error("Error deleting subject:", error);
                alert("❌ Subject delete करता आला नाही.");
            }
        });

        // Add new card before Add Subject button
        addSubjectBtn.parentElement.insertBefore(
            subjectCard,
            addSubjectBtn
        );

        alert("✅ " + subject + " added successfully!");

        console.log("Subject saved to Firebase:", docRef.id);

    } catch (error) {

        console.error("Error adding subject:", error);

        alert("❌ Subject add करता आला नाही.");
    }
});

// ===============================
// LOAD SUBJECTS FROM FIREBASE
// ===============================

async function loadSubjects() {
    try {
        const querySnapshot = await getDocs(collection(db, "subjects"));

        const subjectSection = addSubjectBtn.parentElement;

        // Existing subjects already shown in HTML
        const existingSubjects = Array.from(
            subjectSection.querySelectorAll(".subject-card h3")
        ).map(card => card.textContent.trim());

        querySnapshot.forEach((firebaseSubject) => {

            const subjectData = firebaseSubject.data();
            const subjectName = subjectData.name;

            // Don't create duplicate cards
            if (existingSubjects.some(name => name.includes(subjectName))) {
                return;
            }

            const subjectCard = document.createElement("div");
            subjectCard.className = "subject-card";

            subjectCard.innerHTML = `
                 <h3>📚 ${subjectName}</h3>
                 <p>Your study subject.</p>
                 <button class="delete-subject-btn">❌ Delete</button>
`           ;

             // Delete subject
             const deleteSubjectBtn =
                 subjectCard.querySelector(".delete-subject-btn");

            deleteSubjectBtn.addEventListener("click", async function (event) {
                 event.stopPropagation();

                const confirmDelete = confirm(
                    "Are you sure you want to delete " + subjectName + "?"
                );

                if (!confirmDelete) {
                    return;
                }

                try {
                    await deleteDoc(
                        doc(db, "subjects", firebaseSubject.id)
                    );

                    subjectCard.remove();

                    alert("✅ " + subjectName + " deleted successfully!");

                } catch (error) {
                    console.error("Error deleting subject:", error);
                    alert("❌ Subject delete करता आला नाही.");
                }
            });

            subjectSection.insertBefore(
                subjectCard,
                addSubjectBtn
            );
        });

    } catch (error) {
        console.error("Error loading subjects:", error);
    }
}

async function loadTasks() {
    taskList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "tasks"));

    querySnapshot.forEach((firebaseTask) => {
        const taskData = firebaseTask.data();

        const newTask = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = taskData.completed === true;

        const taskText = document.createTextNode(" " + taskData.title + " ");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";

        // Apply completed style when loading
        if (checkbox.checked) {
            newTask.style.setProperty(
                "text-decoration",
                "line-through",
                "important"
            );
        }

        // Checkbox
        checkbox.addEventListener("change", async function () {
            try {
                await updateDoc(
                    doc(db, "tasks", firebaseTask.id),
                    {
                        completed: checkbox.checked
                    }
                );

                if (checkbox.checked) {
                    newTask.style.setProperty(
                        "text-decoration",
                        "line-through",
                        "important"
                    );
                } else {
                    newTask.style.setProperty(
                        "text-decoration",
                        "none",
                        "important"
                    );
                }

                updateProgress();
                updateStatistics();
                updateSubjectProgress();

            } catch (error) {
                console.error("Error updating task:", error);
            }
        });

        // Delete
        deleteBtn.addEventListener("click", async function () {
            try {
                await deleteDoc(doc(db, "tasks", firebaseTask.id));

                newTask.remove();

                updateProgress();
                updateStatistics();
                updateSubjectProgress();

            } catch (error) {
                console.error("Error deleting task:", error);
            }
        });

        newTask.appendChild(checkbox);
        newTask.appendChild(taskText);
        newTask.appendChild(deleteBtn);

        taskList.appendChild(newTask);
    });
}
addTaskBtn.addEventListener("click", function() {
    const task = prompt("Enter your task:");

    if (task) {
        
        addDoc(collection(db, "tasks"), {
            title: task,
            description: task,
            date: new Date().toISOString().split("T")[0],
            completed: false
        })
        .then(() => {
            console.log("Task saved to Firebase!");
            loadTasks();
        })
        .catch((error) => {
            console.error("Error saving task:", error);
        });

        const newTask = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        checkbox.addEventListener("change", function() {
            updateProgress();
            
            if (checkbox.checked) {
                newTask.style.textDecoration = "line-through";
            } else {
                newTask.style.textDecoration = "none";
            }

            updateProgress();
            updateStatistics();
            updateSubjectProgress();
});

newTask.appendChild(checkbox);
newTask.appendChild(document.createTextNode(" " + task + " "));
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";

        deleteBtn.onclick = function() {
            newTask.remove();
            updateProgress();
            updateStatistics();
            updateSubjectProgress();
        };

        newTask.onclick = function() {
            newTask.style.textDecoration = "line-through";
            updateProgress();
        };

        newTask.appendChild(deleteBtn);
        taskList.appendChild(newTask);
    }
});

const checkboxes = document.querySelectorAll("#taskList input[type='checkbox']");

checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener("change", function() {
        if (checkbox.checked) {
            checkbox.parentElement.style.textDecoration = "line-through";
        } else {
            checkbox.parentElement.style.textDecoration = "none";
        }

        updateProgress();
        updateStatistics();
    });
});

function updateProgress() {
    const tasks = document.querySelectorAll("#taskList li");
    const completedTasks = document.querySelectorAll("#taskList input[type='checkbox']:checked");

    const totalTasks = tasks.length;
    const completed = completedTasks.length;

    let percentage = totalTasks > 0
        ? Math.round((completed / totalTasks) * 100)
        : 0;

    document.getElementById("progressBar").value = percentage;
    document.getElementById("progressText").textContent =
        "Today's Progress: " + percentage + "%";
}

updateProgress();
const searchTask = document.getElementById("searchTask");

searchTask.addEventListener("input", function() {
    const searchText = searchTask.value.toLowerCase();
    const tasks = document.querySelectorAll("#taskList li");

    tasks.forEach(function(task) {
        const taskText = task.textContent.toLowerCase();

        if (taskText.includes(searchText)) {
            task.style.display = "";
        } else {
            task.style.display = "none";
        }
    });
});
const dailyGoal = document.getElementById("dailyGoal");

dailyGoal.addEventListener("input", function() {
    updateDailyGoal();
});

function updateDailyGoal() {
    const goal = Number(dailyGoal.value);
    const completedTasks = document.querySelectorAll("#taskList input[type='checkbox']:checked").length;

    if (goal > 0) {
        const percentage = Math.min(
            Math.round((completedTasks / goal) * 100),
            100
        );

        document.getElementById("progressBar").value = percentage;
        document.getElementById("progressText").textContent =
            "Daily Goal Progress: " + percentage + "%";
    }
}
function updateStatistics() {
    const tasks = document.querySelectorAll("#taskList li");
    const completedTasks = document.querySelectorAll("#taskList input[type='checkbox']:checked");

    document.getElementById("completedStats").textContent =
        "Completed Tasks: " + completedTasks.length;

    document.getElementById("pendingStats").textContent =
        "Pending Tasks: " + (tasks.length - completedTasks.length);
}

updateStatistics();


function updateSubjectProgress() {
    const csTasks = document.querySelectorAll("#taskList li");
    const completedTasks = document.querySelectorAll("#taskList input[type='checkbox']:checked");

    let total = csTasks.length;
    let completed = completedTasks.length;

    let percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    document.getElementById("csProgress").value = percentage;
    document.getElementById("aiProgress").value = percentage;
    document.getElementById("cyberProgress").value = percentage;
}

updateSubjectProgress();
loadTasks();
loadSubjects();

// ===============================
// SUBJECT DETAILS
// ===============================

const subjectNotes = {
    "mathematics": {
        topics: ["Matrices", "Probability", "Differentiation", "Integration"],
        notes: "Mathematics helps students understand numerical concepts, calculations, formulas and problem-solving techniques.",
        questions: ["What is a matrix?", "Explain probability.", "What is differentiation?", "Explain integration."]
    },

    "physics": {
        topics: ["Mechanics", "Thermodynamics", "Waves", "Electromagnetism"],
        notes: "Physics is the study of matter, energy, motion and the interaction between them.",
        questions: ["Explain Newton's laws.", "What is thermodynamics?", "Explain wave motion.", "What is electromagnetic induction?"]
    },

    "python": {
        topics: ["Variables", "Data Types", "Functions", "Loops"],
        notes: "Python is a high-level programming language used for software development, automation, data analysis and artificial intelligence.",
        questions: ["What is Python?", "Explain data types.", "What are functions?", "Explain loops."]
    },

    "dbms": {
        topics: ["Database", "Keys", "Normalization", "SQL"],
        notes: "DBMS is software used to store, organize, manage and retrieve data efficiently.",
        questions: ["What is DBMS?", "What is a primary key?", "Explain normalization.", "What is SQL?"]
    }
};

let currentSubject = "";
if (localStorage.getItem("currentSubject")) {
    currentSubject = localStorage.getItem("currentSubject");
}

// Open subject
function openSubject(subjectName) {
    currentSubject = subjectName;
    localStorage.setItem("currentSubject", currentSubject);

    const subjectDetails = document.getElementById("subjectDetails");
    const selectedSubjectTitle =
        document.getElementById("selectedSubjectTitle");
    const subjectContent =
        document.getElementById("subjectContent");

    subjectDetails.style.display = "block";
    selectedSubjectTitle.textContent = "📚 " + subjectName;

// COMPUTER SCIENCE
if (subjectName === "Computer Science") {
    subjectContent.innerHTML = `
        <h3>💻 Computer Science</h3>

        <h3>📌 Important Topics</h3>
        <ul>
            <li>Software Engineering</li>
            <li>Data Structures</li>
            <li>Database Management System</li>
            <li>Computer Networks</li>
        </ul>

        <h3>📝 Detailed Notes</h3>

        <h4>1. Software Engineering</h4>
        <p>Software Engineering is a systematic approach used for designing, developing, testing, deploying and maintaining software applications. It helps developers create reliable, efficient and high-quality software.</p>

        <h4>Main Phases of Software Engineering</h4>
        <ul>
            <li><b>Requirement Analysis:</b> Understanding user needs and requirements.</li>
            <li><b>System Design:</b> Planning the structure and architecture of the software.</li>
            <li><b>Development:</b> Writing the actual program code.</li>
            <li><b>Testing:</b> Finding and fixing errors in the software.</li>
            <li><b>Deployment:</b> Making the software available to users.</li>
            <li><b>Maintenance:</b> Updating and improving the software.</li>
        </ul>

        <h4>2. Data Structures</h4>
        <p>A Data Structure is a method of organizing and storing data so that it can be accessed and modified efficiently.</p>

        <h4>Types of Data Structures</h4>
        <ul>
            <li><b>Linear:</b> Array, Stack, Queue and Linked List.</li>
            <li><b>Non-Linear:</b> Tree and Graph.</li>
        </ul>

        <h4>3. Database Management System (DBMS)</h4>
        <p>DBMS is software used to create, store, organize, retrieve and manage data efficiently.</p>

        <h4>Examples of DBMS</h4>
        <ul>
            <li>MySQL</li>
            <li>Oracle</li>
            <li>MongoDB</li>
            <li>PostgreSQL</li>
        </ul>

        <h4>Advantages of DBMS</h4>
        <ul>
            <li>Reduces data redundancy.</li>
            <li>Provides data security.</li>
            <li>Makes data management easier.</li>
            <li>Allows quick data retrieval.</li>
        </ul>

        <h4>4. Computer Networks</h4>
        <p>A Computer Network is a group of interconnected computers and devices that communicate and share data, resources and services.</p>

        <h4>Types of Networks</h4>
        <ul>
            <li><b>LAN:</b> Local Area Network.</li>
            <li><b>MAN:</b> Metropolitan Area Network.</li>
            <li><b>WAN:</b> Wide Area Network.</li>
        </ul>

        <h3>❓ Important Questions</h3>
        <ul>
            <li>What is Software Engineering?</li>
            <li>Explain the phases of SDLC.</li>
            <li>What is a Data Structure?</li>
            <li>What is DBMS?</li>
            <li>Explain LAN, MAN and WAN.</li>
        </ul>
    `;
}

// ARTIFICIAL INTELLIGENCE
else if (subjectName === "Artificial Intelligence") {
    subjectContent.innerHTML = `
        <h3>🤖 Artificial Intelligence</h3>

        <h3>📌 Important Topics</h3>
        <ul>
            <li>Introduction to Artificial Intelligence</li>
            <li>Intelligent Agents</li>
            <li>Types of AI</li>
            <li>Search Algorithms</li>
            <li>Machine Learning</li>
        </ul>

        <h3>📝 Detailed Notes</h3>

        <h4>1. Introduction to Artificial Intelligence</h4>
        <p>Artificial Intelligence, commonly known as AI, is a branch of computer science that enables machines to perform tasks that normally require human intelligence.</p>

        <h4>Applications of AI</h4>
        <ul>
            <li>Virtual assistants and chatbots.</li>
            <li>Recommendation systems.</li>
            <li>Self-driving vehicles.</li>
            <li>Medical diagnosis.</li>
            <li>Image and speech recognition.</li>
        </ul>

        <h4>2. Intelligent Agents</h4>
        <p>An Intelligent Agent observes its environment and takes appropriate actions to achieve a specific goal.</p>

        <h4>Types of Intelligent Agents</h4>
        <ul>
            <li>Simple Reflex Agent</li>
            <li>Model-Based Agent</li>
            <li>Goal-Based Agent</li>
            <li>Utility-Based Agent</li>
            <li>Learning Agent</li>
        </ul>

        <h4>3. Types of Artificial Intelligence</h4>
        <ul>
            <li><b>Narrow AI:</b> Designed for a specific task.</li>
            <li><b>General AI:</b> Theoretical AI capable of performing intellectual tasks like humans.</li>
            <li><b>Super AI:</b> Hypothetical AI more intelligent than humans.</li>
        </ul>

        <h4>4. Search Algorithms</h4>
        <p>Search algorithms help AI systems find solutions by exploring different possible states or paths.</p>

        <ul>
            <li><b>BFS:</b> Explores nodes level by level.</li>
            <li><b>DFS:</b> Explores a path deeply before backtracking.</li>
        </ul>

        <h4>5. Machine Learning</h4>
        <p>Machine Learning is a branch of AI that enables computers to learn from data and improve without being explicitly programmed for every task.</p>

        <h4>Types of Machine Learning</h4>
        <ul>
            <li>Supervised Learning</li>
            <li>Unsupervised Learning</li>
            <li>Reinforcement Learning</li>
        </ul>

        <h3>❓ Important Questions</h3>
        <ul>
            <li>What is Artificial Intelligence?</li>
            <li>What are the applications of AI?</li>
            <li>What is an Intelligent Agent?</li>
            <li>Explain the types of Intelligent Agents.</li>
            <li>What are BFS and DFS?</li>
            <li>What is Machine Learning?</li>
        </ul>
    `;
}

else if (subjectName === "Cyber Security") {
    subjectContent.innerHTML = `
        <h3>🔐 Cyber Security</h3>

        <h3>📌 Important Topics</h3>
        <ul>
            <li>Introduction to Cyber Security</li>
            <li>Types of Cyber Attacks</li>
            <li>Malware</li>
            <li>Network Security</li>
            <li>Cryptography</li>
        </ul>

        <h3>📝 Detailed Notes</h3>

        <h4>1. Introduction to Cyber Security</h4>
        <p>
            Cyber Security is the practice of protecting computers, networks,
            systems and data from unauthorized access, attacks and damage.
        </p>

        <h4>Importance of Cyber Security</h4>
        <ul>
            <li>Protects personal and sensitive information.</li>
            <li>Prevents unauthorized access.</li>
            <li>Protects systems from cyber attacks.</li>
            <li>Ensures privacy and data security.</li>
        </ul>

        <h4>2. Types of Cyber Attacks</h4>
        <p>
            A cyber attack is an attempt to gain unauthorized access to a
            computer system, network or data.
        </p>

        <ul>
            <li><b>Phishing:</b> Fake emails or messages used to steal information.</li>
            <li><b>Ransomware:</b> Malware that locks or encrypts data and demands money.</li>
            <li><b>DoS Attack:</b> Overloads a system or server to make it unavailable.</li>
            <li><b>Password Attack:</b> Attempts to steal or guess a user's password.</li>
        </ul>

        <h4>3. Malware</h4>
        <p>
            Malware means malicious software designed to damage, disrupt or
            gain unauthorized access to a computer system.
        </p>

        <h4>Types of Malware</h4>
        <ul>
            <li><b>Virus:</b> A malicious program that can spread between files or systems.</li>
            <li><b>Worm:</b> A program that spreads automatically through networks.</li>
            <li><b>Trojan Horse:</b> Malicious software disguised as legitimate software.</li>
            <li><b>Spyware:</b> Software that secretly collects user information.</li>
        </ul>

        <h4>4. Network Security</h4>
        <p>
            Network Security protects a computer network from unauthorized
            access, misuse and cyber attacks.
        </p>

        <h4>Common Network Security Methods</h4>
        <ul>
            <li>Firewall</li>
            <li>Strong passwords</li>
            <li>Encryption</li>
            <li>Antivirus software</li>
            <li>Secure network protocols</li>
        </ul>

        <h4>5. Cryptography</h4>
        <p>
            Cryptography is the process of protecting information by converting
            it into a secure format so that unauthorized users cannot understand it.
        </p>

        <h4>Important Cryptography Concepts</h4>
        <ul>
            <li><b>Encryption:</b> Converting readable data into coded form.</li>
            <li><b>Decryption:</b> Converting coded data back into readable form.</li>
            <li><b>Key:</b> A value used for encryption and decryption.</li>
            <li><b>Plaintext:</b> Original readable information.</li>
            <li><b>Ciphertext:</b> Encrypted information.</li>
        </ul>

        <h3>❓ Important Questions</h3>
        <ul>
            <li>What is Cyber Security?</li>
            <li>Explain the importance of Cyber Security.</li>
            <li>What are different types of cyber attacks?</li>
            <li>What is Malware? Explain its types.</li>
            <li>What is Network Security?</li>
            <li>What is Cryptography?</li>
            <li>Explain Encryption and Decryption.</li>
            <li>Differentiate between Plaintext and Ciphertext.</li>
        </ul>
    `;
}

else if (subjectNotes[subjectName.toLowerCase()]) {

    const data = subjectNotes[subjectName.toLowerCase()];

    subjectContent.innerHTML = `
        <h3>📚 ${subjectName}</h3>

        <h3>📌 Important Topics</h3>
        <ul>
            ${data.topics.map(topic => `<li>${topic}</li>`).join("")}
        </ul>

        <h3>📝 Detailed Notes</h3>
        <p>${data.notes}</p>

        <h3>❓ Important Questions</h3>
        <ul>
            ${data.questions.map(question => `<li>${question}</li>`).join("")}
        </ul>
    `;
}

else {
    subjectContent.innerHTML = `
        <h3>📚 ${subjectName}</h3>

        <h3>📌 Important Topics</h3>
        <ul>
            <li>Introduction to ${subjectName}</li>
            <li>Basic Concepts</li>
            <li>Important Principles</li>
            <li>Main Components</li>
            <li>Applications</li>
            <li>Advantages and Limitations</li>
        </ul>

        <h3>📝 Detailed Notes</h3>

        <h4>1. Introduction to ${subjectName}</h4>
        <p>
            ${subjectName} is an important subject that helps students
            understand its fundamental concepts, principles and practical
            applications.
        </p>

        <h4>2. Basic Concepts</h4>
        <p>
            The basic concepts of ${subjectName} provide the foundation
            for understanding advanced topics and solving practical problems.
        </p>

        <h4>3. Important Principles</h4>
        <p>
            Understanding the main principles helps students learn how
            ${subjectName} works and how it can be applied in real-life
            situations.
        </p>

        <h4>4. Applications</h4>
        <ul>
            <li>Used for solving practical problems.</li>
            <li>Helps improve knowledge and skills.</li>
            <li>Can be applied in different industries.</li>
            <li>Supports further learning and research.</li>
        </ul>

        <h4>5. Advantages</h4>
        <ul>
            <li>Improves understanding of important concepts.</li>
            <li>Provides useful practical knowledge.</li>
            <li>Helps in solving real-world problems.</li>
            <li>Creates opportunities for further study.</li>
        </ul>

        <h3>❓ Important Questions</h3>
        <ul>
            <li>What is ${subjectName}?</li>
            <li>Explain the basic concepts of ${subjectName}.</li>
            <li>What are the important principles of ${subjectName}?</li>
            <li>Explain the applications of ${subjectName}.</li>
            <li>What are the advantages of ${subjectName}?</li>
            <li>Explain the importance of ${subjectName}.</li>
        </ul>
    `;
}

subjectDetails.scrollIntoView({
    behavior: "smooth"
});

}

window.openSubject = openSubject;

// ===============================
// SUBJECT-WISE PRACTICE PAPER
// ===============================

const questionBank = {

    "computer networks": [
        "Explain the OSI model with all seven layers.",
        "Differentiate between TCP and UDP.",
        "Explain IPv4 addressing and subnetting.",
        "Explain the TCP three-way handshake.",
        "Explain different types of network topologies.",
        "Explain the functions of the Network Layer.",
        "What is multiplexing? Explain its types.",
        "Explain circuit switching and packet switching.",
        "Explain the TCP/IP model.",
        "Explain LAN, MAN and WAN."
    ],

    "artificial intelligence": [
        "What is Artificial Intelligence? Explain its applications.",
        "What is a rational agent? Explain its characteristics.",
        "Explain different types of intelligent agents.",
        "Explain Breadth First Search (BFS) algorithm.",
        "Explain Depth First Search (DFS) algorithm.",
        "Explain Bayes' Theorem with a suitable example.",
        "What is Machine Learning? Explain its types.",
        "Differentiate between BFS and DFS.",
        "Explain knowledge representation in AI.",
        "Explain the applications of Artificial Intelligence."
    ],

    "cyber security": [
        "What is Cyber Security? Explain its importance.",
        "Explain different types of cyber attacks.",
        "What is Malware? Explain its types.",
        "Explain Phishing and its prevention methods.",
        "What is Cryptography? Explain its importance.",
        "Explain the RSA algorithm.",
        "Differentiate between encryption and decryption.",
        "Differentiate between symmetric and asymmetric encryption.",
        "What is Network Security? Explain its importance.",
        "Explain authentication and authorization."
    ],

    "software engineering": [
        "What is Software Engineering? Explain its importance.",
        "Explain the Software Development Life Cycle (SDLC).",
        "Explain different SDLC models.",
        "Explain the Waterfall model with advantages and disadvantages.",
        "What is Agile methodology? Explain its principles.",
        "Explain functional and non-functional requirements.",
        "What is software testing? Explain its types.",
        "Explain verification and validation.",
        "What is software maintenance? Explain its types.",
        "Explain the importance of software documentation."
    ],

    "internet of things": [
        "What is Internet of Things (IoT)? Explain its applications.",
        "Explain the basic architecture of IoT.",
        "Explain the major components of an IoT system.",
        "What are IoT sensors and actuators?",
        "Explain communication technologies used in IoT.",
        "Explain IoT applications in smart homes.",
        "Explain IoT applications in healthcare.",
        "Explain the advantages and challenges of IoT.",
        "Explain the role of cloud computing in IoT.",
        "Explain security challenges in IoT."
    ],

    "dbms": [
        "What is DBMS? Explain its advantages.",
        "Differentiate between DBMS and RDBMS.",
        "Explain different types of database models.",
        "What is a primary key? Explain different types of keys.",
        "Explain normalization and its types.",
        "What is SQL? Explain DDL, DML and DCL commands.",
        "Explain different types of SQL joins.",
        "What is a transaction? Explain ACID properties.",
        "Explain database constraints.",
        "What is data redundancy? How can it be reduced?"
    ],

    "data structures": [
        "What is a Data Structure? Explain its classification.",
        "Explain arrays and their operations.",
        "Explain stack data structure and its applications.",
        "Explain queue and its different types.",
        "Explain linked list and its types.",
        "Differentiate between stack and queue.",
        "Explain binary trees and their types.",
        "Explain tree traversal techniques.",
        "Explain graphs and their representations.",
        "Explain searching and sorting techniques."
    ],

    "operating systems": [
        "What is an Operating System? Explain its functions.",
        "Explain different types of Operating Systems.",
        "Explain process management in an Operating System.",
        "Differentiate between process and thread.",
        "Explain CPU scheduling algorithms.",
        "What is deadlock? Explain its necessary conditions.",
        "Explain memory management techniques.",
        "Explain virtual memory.",
        "What is file management in an Operating System?",
        "Explain the concept of process synchronization."
    ],

    "mathematics": [
        "Explain the concept of matrices and their types.",
        "Solve problems based on determinants.",
        "Explain differentiation and its applications.",
        "Explain integration and its applications.",
        "Solve problems based on differential equations.",
        "Explain probability and its basic concepts.",
        "Explain permutations and combinations.",
        "Solve problems based on binomial theorem.",
        "Explain limits and continuity.",
        "Explain vectors and their applications."
    ],

    "physics": [
        "Explain the laws of thermodynamics.",
        "Explain the concept of wave motion.",
        "Explain electromagnetic induction.",
        "State and explain Coulomb's law.",
        "Explain electric field and electric potential.",
        "Explain semiconductor devices and their applications.",
        "Explain the working principle of a laser.",
        "Explain optical fiber and its applications.",
        "Explain the photoelectric effect.",
        "Explain the concept of quantum mechanics."
    ],

    "chemistry": [
        "Explain the periodic properties of elements.",
        "Explain chemical bonding and its types.",
        "Explain the concept of thermodynamics in chemistry.",
        "Explain electrochemical cells and their applications.",
        "What is corrosion? Explain its prevention methods.",
        "Explain polymers and their applications.",
        "Explain different types of chemical reactions.",
        "Explain acids, bases and pH.",
        "Explain organic functional groups.",
        "Explain the principles of green chemistry."
    ],

    "biology": [
        "Explain the structure and functions of a cell.",
        "Explain different types of cell division.",
        "Explain DNA structure and replication.",
        "Explain RNA and protein synthesis.",
        "Explain Mendel's laws of inheritance.",
        "Explain the process of photosynthesis.",
        "Explain cellular respiration.",
        "Explain the human digestive system.",
        "Explain the human circulatory system.",
        "Explain biotechnology and its applications."
    ],

    "environmental studies": [
        "Explain the concept and importance of environmental studies.",
        "Explain different types of natural resources.",
        "Explain causes and effects of air pollution.",
        "Explain causes and effects of water pollution.",
        "Explain soil pollution and its prevention.",
        "Explain climate change and global warming.",
        "Explain biodiversity and its importance.",
        "Explain solid waste management.",
        "Explain renewable and non-renewable energy resources.",
        "Explain sustainable development."
    ],

    "economics": [
        "What is Economics? Explain its basic concepts.",
        "Explain the law of demand with a suitable example.",
        "Explain the law of supply.",
        "Explain price elasticity of demand.",
        "Explain the concept of national income.",
        "Explain inflation and its causes.",
        "Explain different types of unemployment.",
        "Explain the functions of money.",
        "Explain fiscal policy and monetary policy.",
        "Explain the role of banks in an economy."
    ],

    "business studies": [
        "What is Business? Explain its characteristics.",
        "Explain different forms of business organization.",
        "Explain the functions of management.",
        "Explain the principles of management.",
        "Explain the importance of planning.",
        "Explain the process of organizing.",
        "Explain different leadership styles.",
        "Explain motivation and its importance.",
        "Explain the process of marketing management.",
        "Explain the importance of financial management."
    ],

    "accountancy": [
        "Explain the basic concepts of accounting.",
        "Explain the accounting equation with examples.",
        "Explain journal entries and their importance.",
        "Explain ledger posting and balancing.",
        "Prepare a trial balance and explain its purpose.",
        "Explain depreciation and its methods.",
        "Explain preparation of final accounts.",
        "Differentiate between capital and revenue expenditure.",
        "Explain bank reconciliation statement.",
        "Explain accounting principles and conventions."
    ],

    "history": [
        "Explain the major causes of the Industrial Revolution.",
        "Explain the important events of the French Revolution.",
        "Explain the causes and effects of the First World War.",
        "Explain the causes and effects of the Second World War.",
        "Explain the major events of the Indian Freedom Movement.",
        "Explain the role of Mahatma Gandhi in India's freedom struggle.",
        "Explain the causes of the Non-Cooperation Movement.",
        "Explain the Civil Disobedience Movement.",
        "Explain the Quit India Movement.",
        "Explain the significance of India's independence."
    ],

    "geography": [
        "Explain the structure and composition of the Earth.",
        "Explain different types of rocks.",
        "Explain the causes and effects of earthquakes.",
        "Explain different types of climate.",
        "Explain the factors affecting climate.",
        "Explain population distribution and density.",
        "Explain urbanization and its effects.",
        "Explain natural resources and their distribution.",
        "Explain agriculture and its major types.",
        "Explain environmental problems related to human activities."
    ],

    "political science": [
        "What is Political Science? Explain its importance.",
        "Explain the meaning and features of democracy.",
        "Explain the main features of the Indian Constitution.",
        "Explain Fundamental Rights in India.",
        "Explain the Directive Principles of State Policy.",
        "Explain the powers and functions of the President of India.",
        "Explain the role and powers of the Prime Minister.",
        "Explain the structure and functions of Parliament.",
        "Explain the importance of elections in democracy.",
        "Explain the role of political parties."
    ],

    "english": [
        "Explain the importance of communication skills.",
        "Differentiate between verbal and non-verbal communication.",
        "Explain the barriers to effective communication.",
        "Write a formal letter on a suitable topic.",
        "Write a professional email for a given situation.",
        "Explain the importance of presentation skills.",
        "Explain different types of interviews.",
        "Write a resume for a job application.",
        "Explain the importance of group discussion.",
        "Write an essay on a contemporary social issue."
    ],

    "web development": [
        "What is HTML? Explain the basic structure of an HTML document.",
        "Explain different HTML form elements.",
        "What is CSS? Explain different types of CSS.",
        "Explain the CSS box model.",
        "What is JavaScript? Explain its features.",
        "Explain JavaScript functions and events.",
        "Explain DOM manipulation in JavaScript.",
        "Differentiate between client-side and server-side scripting.",
        "Explain responsive web design.",
        "Explain the role of APIs in web development."
    ],

    "cloud computing": [
        "What is Cloud Computing? Explain its characteristics.",
        "Explain different cloud service models.",
        "Explain different cloud deployment models.",
        "Differentiate between public, private and hybrid cloud.",
        "Explain Infrastructure as a Service (IaaS).",
        "Explain Platform as a Service (PaaS).",
        "Explain Software as a Service (SaaS).",
        "Explain advantages and challenges of cloud computing.",
        "Explain virtualization in cloud computing.",
        "Explain cloud security."
    ],

    "cryptography": [
        "What is Cryptography? Explain its objectives.",
        "Differentiate between plaintext and ciphertext.",
        "Explain Caesar Cipher.",
        "Explain Playfair Cipher.",
        "Explain Hill Cipher.",
        "Differentiate between symmetric and asymmetric cryptography.",
        "Explain the RSA algorithm.",
        "Explain digital signatures.",
        "Explain hashing and its applications.",
        "Explain authentication and non-repudiation."
    ]

};

// ===============================
// GENERATE PRACTICE PAPER
// ===============================

const generatePaperBtn = document.getElementById("generatePaperBtn");
const practiceSubject = document.getElementById("practiceSubject");
const practicePaper = document.getElementById("practicePaper");
const downloadPaperBtn = document.getElementById("downloadPaperBtn");
const paperMessage = document.getElementById("paperMessage");

if (generatePaperBtn) {

    generatePaperBtn.addEventListener("click", function () {

        const subject = practiceSubject.value.trim().toLowerCase();

        if (!subject) {
            paperMessage.textContent =
                "⚠️ Please enter a subject name.";
            practicePaper.innerHTML = "";
            downloadPaperBtn.style.display = "none";
            return;
        }

        const questions = questionBank[subject];

        if (!questions) {

            paperMessage.textContent =
                "⚠️ Practice paper for this subject is not available yet.";

            practicePaper.innerHTML = `
                <p>❌ No important questions found for:
                <b>${practiceSubject.value.trim()}</b></p>
                <p>💡 Please try another subject.</p>
            `;

            downloadPaperBtn.style.display = "none";
            return;
        }

        let questionHTML = `
            <h3>📄 ${practiceSubject.value.trim()} - Important Practice Questions</h3>
            <ol>
        `;

        questions.forEach(function (question) {
            questionHTML += `<li>${question}</li>`;
        });

        questionHTML += `</ol>`;

        practicePaper.innerHTML = questionHTML;

        paperMessage.textContent =
            "✅ Practice paper generated successfully!";

        downloadPaperBtn.style.display = "inline-block";
    });
}
// ===============================
// DOWNLOAD PRACTICE PAPER AS PDF
// ===============================

if (downloadPaperBtn) {
    downloadPaperBtn.addEventListener("click", function () {

        const subject = practiceSubject.value.trim();

        if (!subject || !practicePaper.innerText.trim()) {
            alert("⚠️ Please generate a practice paper first.");
            return;
        }

        const paperContent = practicePaper.innerHTML;

        const printWindow = window.open("", "_blank");

        printWindow.document.write(`
            <html>
            <head>
                <title>${subject} - Practice Paper</title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        line-height: 1.7;
                    }

                    h1 {
                        text-align: center;
                    }

                    h3 {
                        margin-top: 30px;
                    }

                    li {
                        margin-bottom: 15px;
                    }
                </style>
            </head>

            <body>

                <h1>📚 Smart Study Planner</h1>

                ${paperContent}

            </body>
            </html>
        `);

        printWindow.document.close();

        printWindow.onload = function () {
            printWindow.print();
        };
    });
}
// ===============================
// PERSONAL PERFORMANCE REPORT
// ===============================

const generateReportBtn = document.getElementById("generateReportBtn");

generateReportBtn.addEventListener("click", function () {

    const tasks = document.querySelectorAll("#taskList li");
    const completedTasks = document.querySelectorAll(
        "#taskList input[type='checkbox']:checked"
    );

    const total = tasks.length;
    const completed = completedTasks.length;
    const pending = total - completed;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    document.getElementById("reportTotalTasks").textContent =
        "Total Tasks: " + total;

    document.getElementById("reportCompletedTasks").textContent =
        "Completed Tasks: " + completed;

    document.getElementById("reportPendingTasks").textContent =
        "Pending Tasks: " + pending;

    document.getElementById("reportProgress").textContent =
        "Overall Performance: " + percentage + "%";

    // Guidance
    let guidance = "";

    if (percentage >= 80) {
        guidance = "Excellent performance! Keep following your study plan.";
    } else if (percentage >= 50) {
        guidance = "Good performance. Try to complete the remaining pending tasks.";
    } else {
        guidance = "More attention is needed. Complete your pending tasks and give extra study time.";
    }

    document.getElementById("guidanceText").textContent = guidance;

    // Show Download button
    document.getElementById("downloadReportBtn").style.display = "inline-block";

    generateSubjectGraph();

});

// ===============================
// DOWNLOAD PERFORMANCE REPORT AS PDF
// ===============================

const downloadReportBtn = document.getElementById("downloadReportBtn");

downloadReportBtn.addEventListener("click", function () {

    const reportContent =
        document.getElementById("performanceReportSection").innerHTML;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
        <html>
        <head>
            <title>Personal Performance Report</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    line-height: 1.7;
                }

                h1, h2, h3 {
                    text-align: center;
                }

                progress {
                    width: 100%;
                    height: 20px;
                }
      
                #downloadReportBtn {
                    display: none !important;

                }
            </style>
        </head>

        <body>

            <h1>📚 Smart Study Planner</h1>

            ${reportContent}

        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.print();
    };
});

// ===============================
// SUBJECT-WISE PERFORMANCE GRAPH
// ===============================

function generateSubjectGraph() {

    const subjectGraph = document.getElementById("subjectGraph");

    if (!subjectGraph) return;

    subjectGraph.innerHTML = "";

    const subjects = {};

    document.querySelectorAll("#taskList li").forEach(task => {

        const checkbox = task.querySelector("input[type='checkbox']");

        if (!checkbox) return;

        const subject = task.dataset.subject || "General";

        if (!subjects[subject]) {
            subjects[subject] = {
                total: 0,
                completed: 0
            };
        }

        subjects[subject].total++;

        if (checkbox.checked) {
            subjects[subject].completed++;
        }
    });

    if (Object.keys(subjects).length === 0) {
        subjectGraph.innerHTML =
            "<p>No subject performance available yet.</p>";
        return;
    }

    Object.keys(subjects).forEach(subject => {

        const total = subjects[subject].total;
        const completed = subjects[subject].completed;

        const percentage = Math.round((completed / total) * 100);

        const container = document.createElement("div");

        container.innerHTML = `
            <p><strong>${subject}</strong> - ${percentage}%</p>

            <progress value="${percentage}" max="100"></progress>

            <p>
                ✅ Completed: ${completed}
                &nbsp;&nbsp;
                ❌ Pending: ${total - completed}
            </p>
        `;

        subjectGraph.appendChild(container);
    });
}
// LOGOUT
const logoutBtn = document.querySelector(".logout-menu");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {

        if (confirm("Are you sure you want to logout?")) {
            window.location.href = "login.html";
        }

    });
}