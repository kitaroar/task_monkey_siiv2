// ==UserScript==
// @name         Trimitere Task si Email
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Adaugă un buton și un formular pe pagina web care trimite date către Google Apps Script
// @author       ORCT_AR
// @match        *://rc-prod.onrc.sii/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      onrc.eu.org
// @updateURL    https://github.com/kitaroar/task_monkey_siiv2/raw/refs/heads/main/Email_Task_Monkey_SIIv2.user.js
// @downloadURL  https://github.com/kitaroar/task_monkey_siiv2/raw/refs/heads/main/Email_Task_Monkey_SIIv2.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Definire variabile
    let usernameExpeditor = '';
    let usernameDestinatar = '';
    let numarInregistrare = '';
    let dataInregistrare = '';
    let registrator = '';
    let operator = '';
    let formData = ''; // Will store form data (checkboxes and message)

    // Creăm un buton pe pagina web
    const button = document.createElement('button');
    button.innerHTML = 'Adaugă Task';
    button.style.position = 'fixed'; // Facem butonul vizibil permanent
    button.style.bottom = '10px'; // Plasăm butonul în colțul din dreapta jos
    button.style.right = '20px';
    button.style.padding = '4px 10px';
    button.style.borderRadius = '3px';
    button.style.color = '#FFF';
    button.style.backgroundColor = 'orange';
    button.style.border = '1px solid orange';
    button.style.zIndex = 1000;

    // Adăugăm butonul în document
    document.body.appendChild(button);

    // Add event listener to the button to open the form
    button.addEventListener('click', function() {
        // Function to get the value of a cookie by name
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        usernameExpeditor = getCookie('username') || 'Necunoscut';
        if(usernameExpeditor === 'Necunoscut'){
            alert('Username necunoscut. Te rog să dai Logout si sa intri iar in program');
            return; // Prevent form to open
        }

        const headers = document.querySelectorAll('th.ant-table-cell');

        let columnIndexes = {
            numarInregistrare: -1,
            dataInregistrare: -1,
            registrator: -1,
            operator: -1
        };

        // Find the column indices based on the header text
        headers.forEach((header, index) => {
            const headerText = header.innerText.trim();
            if (headerText.includes('Număr înregistrare')) {
                columnIndexes.numarInregistrare = index;
            } else if (headerText.includes('Dată înregistrare')) {
                columnIndexes.dataInregistrare = index;
            } else if (headerText.includes('Registrator')) {
                columnIndexes.registrator = index;
            } else if (headerText.includes('Operator')) {
                columnIndexes.operator = index;
            }
        });

        // Select the 3rd row (excluding the header and filter rows)
        const thirdRow = document.querySelectorAll('tr.ant-table-row')[2];

        if (thirdRow) {
            const cells = thirdRow.querySelectorAll('td');
            numarInregistrare = cells[columnIndexes.numarInregistrare]?.innerText.trim() || 'Necunoscut';
            dataInregistrare = cells[columnIndexes.dataInregistrare]?.innerText.trim() || 'Necunoscut';
            registrator = cells[columnIndexes.registrator]?.innerText.trim() || 'Necunoscut';
            operator = cells[columnIndexes.operator]?.innerText.trim() || 'Necunoscut';
        } else {
            console.log('3rd row not found');
            alert('Nu ești în fereastra care trebuie!\nIntra la Procesare cereri și caută un număr de dosar');
            return; // Prevent form submission
        }

        // Variabila pentru test -> comenteaza in productie
        //usernameExpeditor = 'adriana.mirea';
        //numarInregistrare = '9999999';
        //dataInregistrare = '31.12.2024';
        //registrator = 'alexandra.decean';
        //operator = 'madalina.manda';

        //console.log('Username:', usernameExpeditor);
        //console.log(`Număr înregistrare: ${numarInregistrare}`);
        //console.log(`Dată înregistrare: ${dataInregistrare}`);
        //console.log(`Registrator: ${registrator}`);
        //console.log(`Operator: ${operator}`);

        if(numarInregistrare === 'Necunoscut' || dataInregistrare === 'Necunoscut' ){
            alert('Nu s-a putut prelua numărul sau data înregistrării');
            return; // Prevent form to open
        }

        createForm();
    });

    // Function to create and display the form
    function createForm() {
        // Create the form container
        const formContainer = document.createElement('div');
        formContainer.id = 'customForm';
        formContainer.style.position = 'fixed';
        formContainer.style.top = '20%';
        formContainer.style.left = '30%';
        formContainer.style.backgroundColor = 'white';
        formContainer.style.border = '1px solid #ccc';
        formContainer.style.padding = '20px';
        formContainer.style.zIndex = 10000;
        formContainer.style.width = '600px';
        formContainer.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.1)';

        // Create the close button
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '18px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.color = '#888';

        closeButton.addEventListener('click', function() {
            document.body.removeChild(formContainer); // Close the form when 'X' is clicked
        });

        // Create the cancel button
        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = 'Renunță';
        cancelButton.style.position = 'absolute';
        cancelButton.style.bottom = '20px';
        cancelButton.style.right = '20px';
        cancelButton.style.padding = '2px 10px';
        cancelButton.style.border = '1px solid #AAA';
        cancelButton.style.fontSize = '16px';
        cancelButton.style.borderRadius = '3px';
        cancelButton.style.zIndex = 1000;

        cancelButton.addEventListener('click', function() {
            document.body.removeChild(formContainer); // Close the form when 'Cancel' is clicked
        });

        // Append the close and cancel buttons
        formContainer.appendChild(closeButton);
        formContainer.appendChild(cancelButton);

        // Create the form element
        const formElement = document.createElement('form');
        formElement.id = 'myForm';

        // Set initial radio button states
        let operatorChecked = '';
        let registratorChecked = '';

        if (usernameExpeditor === operator) {
            operatorChecked = '';
            registratorChecked = 'checked';
        } else if (usernameExpeditor === registrator) {
            operatorChecked = 'checked';
            registratorChecked = '';
        }

        // Append the checkboxes and text area to the form
        const formContent = `
            <h5>Probleme la dosar Nr. ${numarInregistrare} / ${dataInregistrare}:</h5>
            <hr>
            <div>
                <input type="checkbox" id="option1" name="options" value="Semnați încheierea">
                <label for="option1">Semnați încheierea</label><br>
            </div>
            <div>
                <input type="checkbox" id="option2" name="options" value="Încărcați încheierea">
                <label for="option2">Încărcați încheierea</label><br>
            </div>
            <div>
                <input type="checkbox" id="option3" name="options" value="Corectați opisul">
                <label for="option3">Corectați opisul</label><br>
            </div>
            <br/>
            <div>
                <label for="messageBox">Alte probleme:</label><br>
                <textarea id="messageBox" name="message" rows="4" cols="60"></textarea><br><br>
            </div>
            <div>
                <label>Trimite către:</label><br>
                <input type="radio" id="operatorRadio" name="role" value="${operator}" ${operatorChecked} ${operatorChecked || registratorChecked ? 'disabled' : ''}>
                <label for="operatorRadio">Operator - ${operator}</label><br>
                <input type="radio" id="registratorRadio" name="role" value="${registrator}" ${registratorChecked} ${operatorChecked || registratorChecked ? 'disabled' : ''}>
                <label for="registratorRadio">Registrator - ${registrator}</label><br><br>
            </div>
            <input type="submit" value="Trimite">
        `;

        // Append the form content to the form
        formElement.innerHTML = formContent;

        // Append the form to the form container
        formContainer.appendChild(formElement);

        // Add the form container to the body
        document.body.appendChild(formContainer);

        // Add event listener for form submission
        document.getElementById('myForm').addEventListener('submit', function(event) {
            event.preventDefault();

            // Get selected checkboxes
            let selectedOptions = [];
            document.querySelectorAll('input[name="options"]:checked').forEach((checkbox) => {
                selectedOptions.push(checkbox.value);
            });

            // Get the message box content
            let message = document.getElementById('messageBox').value.trim();

            // Get the selected role
            let role = document.querySelector('input[name="role"]:checked')?.value || 'Necunoscut';

            // Combine selected checkboxes, message, and role into one string
            // Combine selected checkboxes and message into one string
            if (selectedOptions.length > 0) {
                formData = selectedOptions.join(', ');
            } else {
                formData = ''; // No checkboxes selected
            }

            if (message) {
                // If there are selected options, append with a comma, otherwise just add the message
                formData += formData ? ', ' + message : message;
            }

            // Check if a message is empty
            if (formData.length==0) {
                alert('Bifează un mesaj sau scrie problema în caseta text!');
                return; // Prevent form submission
            }
                        // Check if a radio button is selected
            if (!document.querySelector('input[name="role"]:checked')) {
                alert('Alege un destinatar pentru mesaj (Registrator sau Operator)!');
                return; // Prevent form submission
            }

            usernameDestinatar = role

            // Log the form data
            console.log("Mesaj de trimis:", formData);
            console.log("Destinatar: ", usernameDestinatar);

            // Call function to collect page data and submit everything
            collectDataAndSubmit();

            // Remove the form after submission
            document.body.removeChild(formContainer);
        });
    }

    // Function to collect data from the page and submit everything
    function collectDataAndSubmit() {

        const dateDeTrimis = JSON.stringify({
            numarInregistrare: numarInregistrare,
            dataInregistrare: dataInregistrare,
            usernameDestinatar: usernameDestinatar,
            usernameExpeditor: usernameExpeditor,
            formData: formData,
      })

        console.log("Date transmise: ", dateDeTrimis);

        // Trimiterea datelor către Google Apps Script prin POST request
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://onrc.eu.org/api/administrator/adauga-task",
            headers: { "Content-Type": "application/json" },
            data: dateDeTrimis,
            onload: function(response) {
                try {
                    // Parse the JSON response text
                    var data = JSON.parse(response.responseText);
                    console.log("Email Utilizator:", data.emailUtilizator);
                    console.log("Răspuns de la Google Apps Script:", response.responseText);
                    alert(data.message);

                    //console.log("Răspuns de la Google Apps Script:", response.responseText);
                    //alert("Task-ul a fost adăugat cu succes!");
                    // Variabilele predefinite

                    let emailDestinatar = data.emailUtilizator || 'Introdu adresa de email';
                    let subiect = 'Vă rog remediați cererea: ' + numarInregistrare + ' din ' + dataInregistrare; // Subiectul emailului
                    let corpEmail = 'Vă rog remediați cererea: ' + numarInregistrare + ' din ' + dataInregistrare + '\nCe are următoarea problemă: ' + formData;;

                    // Construim URL-ul de tip mailto
                    let mailtoLink = 'mailto:' + emailDestinatar + '?subject=' + encodeURIComponent(subiect) + '&body=' + encodeURIComponent(corpEmail);

                    // Deschidem clientul de email implicit
                    window.location.href = mailtoLink;

                } catch (e) {
                    console.error("Eroare la parsarea răspunsului JSON:", e);
                    alert("A apărut o eroare la parsarea răspunsului.");
                }
            },
            onerror: function(response) {
                console.log("Eroare la trimiterea datelor:", response);
                alert("A apărut o eroare la trimiterea datelor.");
            }
        });
    }

})();
