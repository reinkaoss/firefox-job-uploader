console.log("platformFiller.js: top-level code loaded!");

chrome.runtime.onMessage.addListener((msg) => {
  console.log("Message received in platformFiller.js:", msg);
  if (msg.action === "fillPlatformPage" && msg.jobData) {
    fillPlatformPage(msg.jobData)
      .catch(err => console.error("Error in fillPlatformPage:", err));
  }
});

async function fillPlatformPage(jobData) {
  console.log("Filling the page with job data:", jobData);
  try {
    // 1) Click "Create Job" button
    const createBtn = await waitForElement('[data-cy-id="create-job"]', 300);
    console.log("Found create-job button:", createBtn);
    createBtn.click();
    // await sleep(2000);


    // 2) Fill job title
    const titleInput = await waitForElement('input[name="job-name-txt"]', 300);
    fillInput(titleInput, jobData.title);
    console.log("Title filled with:", jobData.title);
    // await sleep(1000);

    // 3) Submit "Create Job"
    const createJobSubmit = await waitForElement('[data-cy-id="create-job-submit"]', 300);
    createJobSubmit.click();
    console.log("Clicked create job submit!");
    // await sleep(3000);


    // Check if the apply link is an email address
const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

// Handle the apply link/email based on type
const handleApplyMethod = async (jobData) => {
  try {
    const applyValue = jobData.applyLink;
    
    if (!applyValue) {
      throw new Error('Apply link/email is required');
    }

    // Determine if it's an email address
    const useEmail = isEmail(applyValue);
    
    // Select the appropriate radio button based on type
    const radioValue = useEmail ? 'mailto' : 'redirect';
    const applyMethodRadio = await waitForElement(`input[type="radio"][value="${radioValue}"]`, 1000);
    
    if (!applyMethodRadio.checked) {
      applyMethodRadio.click();
      console.log(`Checked the "${useEmail ? 'Email Address' : 'Apply Link'}" radio button`);
    }
    await sleep(500);

    // Fill in the appropriate input field
    const inputName = useEmail ? 'mailtoLink' : 'jobRedirect';
    const applyInput = await waitForElement(`input[name="${inputName}"]`, 1000);
    fillInput(applyInput, applyValue);
    console.log(`${useEmail ? 'Email address' : 'Apply link'} filled with:`, applyValue);
    await sleep(200);

  } catch (error) {
    console.error('❌ Error handling apply method:', error);
  }
};

// Call the function with the jobData
await handleApplyMethod(jobData);

    // 5) Ongoing Deadline => uncheck if needed
    await sleep(1000);
    const ongoingCheckbox = await waitForElement('input[type="checkbox"][name="ongoing"]', 500);
    // Only uncheck if a valid deadline is provided
    if (jobData.deadline && jobData.deadline !== 'null' && jobData.deadline !== '' && ongoingCheckbox.checked) {
      ongoingCheckbox.click();
      console.log('Unchecked the "Ongoing Deadline" checkbox because a deadline is provided');
    }
    await sleep(500);

    // 6) Open date picker and select the deadline date (DD/MM/YYYY)
    // e.g. jobData.deadline = "31/12/2024"
    const parsedDate = parseDDMMYYYY(jobData.deadline);
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      console.warn("Invalid or missing deadline date:", jobData.deadline, "Skipping date picker selection.");
    } else {
      await selectDate(parsedDate);
      await sleep(300);
    }

    // 7) Salary/Benefits
    const benefitsInput = await waitForElement('input[name="benefits"]', 200);
    fillInput(benefitsInput, jobData.salary);
    console.log("Salary filled with:", jobData.salary);
    await sleep(200);

    // 7.1) Salary Dropdown
    async function selectDropdown(jobSalary) {
        try {
            console.log("📌 Attempting to open and navigate dropdown...");
    
            // Salary options & positions
            const salaryOptions = [
                "Do Not Show",
                "Less than £10,000",
                "£10,000 - £11,999",
                "£12,000 - £13,999",
                "£14,000 - £15,999",
                "£16,000 - £17,999",
                "£18,000 - £19,999",
                "£20,000 - £21,999",
                "£22,000 - £23,999",
                "£24,000 - £25,999",
                "£26,000 - £27,999",
                "£28,000 - £29,999",
                "£30,000+",
                "Competitive",
                "Unpaid" 
            ];
    
            // Convert jobSalary to a number (e.g. "£25,300" → 25300)
            let salaryNum = parseInt(jobSalary.replace(/[^0-9]/g, ""), 10);
    
            // Find the best match for salary
            let targetIndex = salaryOptions.findIndex(option => {
                let match = option.match(/£([\d,]+) - £([\d,]+)/);
                if (match) {
                    let min = parseInt(match[1].replace(/,/g, ""), 10);
                    let max = parseInt(match[2].replace(/,/g, ""), 10);
                    return salaryNum >= min && salaryNum <= max;
                }
                return false;
            });
    
            // If no match, default to "Do Not Show"
            if (targetIndex === -1) {
                console.log(`⚠️ No exact match for "${jobSalary}" (${salaryNum}). Defaulting to "Do Not Show".`);
                targetIndex = 0;
            }
    
            console.log(`✅ Selecting salary: ${salaryOptions[targetIndex]}`);
    
            // // 1️⃣ Click the dropdown arrow to open it
            // const dropdownArrow = await waitForElement("i.v-select__menu-icon", 1000);
            // console.log("✅ Found dropdown arrow:", dropdownArrow);
            // dropdownArrow.click();
            // await sleep(700);
    
            // // 2️⃣ Wait for the dropdown input field
            // const dropdownInput = await waitForElement("input[name='salaryId']", 1000);
            // console.log("✅ Dropdown input found:", dropdownInput);
            // dropdownInput.focus();
            // await sleep(500);
    
            // // 3️⃣ Move down the required number of times
            // console.log(`📌 Moving down ${targetIndex} times...`);
            // for (let i = 0; i <= targetIndex; i++) {
            //     dropdownInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            //     await sleep(300);
            // }

                        // 1️⃣ Click the dropdown arrow to open it
                        const dropdownArrow = await waitForElement("i.v-select__menu-icon", 100);
                        console.log("✅ Found dropdown arrow:", dropdownArrow);
                        dropdownArrow.click();
                        await sleep(50);
                
                        // 2️⃣ Wait for the dropdown input field
                        const dropdownInput = await waitForElement("input[name='salaryId']", 100);
                        console.log("✅ Dropdown input found:", dropdownInput);
                        dropdownInput.focus();
                        await sleep(50);
                
                        // 3️⃣ Move down the required number of times
                        console.log(`📌 Moving down ${targetIndex} times...`);
                        for (let i = 0; i <= targetIndex; i++) {
                            dropdownInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                            await sleep(50);
                        }
    
            // 4️⃣ LOG ALL DROPDOWN OPTIONS (to debug missing elements)
            const dropdownOptions = document.querySelectorAll('.v-list-item');
            console.log("📌 Available dropdown options:", dropdownOptions.length);
    
            if (dropdownOptions.length === 0) {
                throw new Error("⚠️ No dropdown options detected!");
            }
    
            // 5️⃣ Try selecting the active option
            let selectedOption = document.querySelector(".v-list-item--active");
    
            if (!selectedOption) {
                console.log("⚠️ No active option found, selecting the first available.");
                selectedOption = dropdownOptions[targetIndex] || dropdownOptions[0]; // Fallback: target or first option
            }
    
            if (selectedOption) {
                console.log("✅ Clicking option:", selectedOption.innerText);
                selectedOption.click();
            } else {
                throw new Error("⚠️ No selectable option found!");
            }
    
            await sleep(500);
            console.log("✅ Dropdown selection completed.");
    
        } catch (err) {
            console.error(" Error selecting dropdown:", err);
        }
    }
    
    // 🏹 Run the function with salary data
    await selectDropdown(jobData.salary);

    // 7.1) Relevanr Year and Start Date
    async function handleRelevantYearCheckboxes(jobData) {
      console.log("relevant year is", jobData.relevantYear);
      if (!jobData || !jobData.relevantYear) {
        console.warn("No relevant year data provided.");
        return;
      }
    
      // Normalize the relevantYear string and split into individual entries.
      const relevantYears = jobData.relevantYear
        .split(',')
        .map(year => year.trim().toLowerCase());
    
      // Mapping of expected keywords to the corresponding checkbox aria-label text.
      const checkboxMapping = {
        "1st years": "Is job relevant to 1st years?",
        "1st year": "Is job relevant to 1st years?",
        "2nd years": "Is job relevant to 2nd years?",
        "2nd year": "Is job relevant to 2nd years?",
        "3rd years": "Is job relevant to 3rd years?",
        "3rd year" : "Is job relevant to 3rd years?",
        "graduate": "Is job relevant to Graduates?",
        "graduates": "Is job relevant to Graduates?"
      };
    
      // Iterate over each mapping key.
      for (const [key, ariaLabel] of Object.entries(checkboxMapping)) {
        // If the keyword is present in the relevantYears array...
        if (relevantYears.includes(key)) {
          try {
            // Find the checkbox using its aria-label attribute.
            const checkbox = await waitForElement(`input[aria-label="${ariaLabel}"]`, 1000);
            if (checkbox && !checkbox.checked) {
              checkbox.click();
              console.log(`Checked the checkbox for "${ariaLabel}"`);
            }
          } catch (error) {
            console.error(`Could not find checkbox for "${ariaLabel}":`, error);
          }
        }
      }
    }

    await handleRelevantYearCheckboxes(jobData);

    // 7.2) Start Date

    async function setEmploymentStartDate(jobData) {
      if (!jobData || !jobData.startDate) {
        console.warn('No start date provided in jobData.');
        return;
      }
    
      try {
        // Find the label element containing 'Employment Start Date' (case-insensitive)
        const labels = Array.from(document.querySelectorAll('label'));
        const targetLabel = labels.find(label =>
          label.textContent && label.textContent.toLowerCase().includes('employment start date')
        );
    
        if (!targetLabel) {
          console.error('Employment Start Date label not found.');
          return;
        }
    
        // Get the value of the 'for' attribute from the label
        const inputId = targetLabel.getAttribute('for');
        let inputField;
    
        if (inputId) {
          inputField = document.getElementById(inputId);
        } else {
          // If no 'for' attribute, try to find an input in the same container
          inputField = targetLabel.querySelector('input');
        }
    
        if (!inputField) {
          console.error('Input field for Employment Start Date not found.');
          return;
        }
    
        // Set the input field's value to jobData.startDate and trigger events
        inputField.value = jobData.startDate;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
    
        console.log(`Employment Start Date set to: ${jobData.startDate}`);
      } catch (error) {
        console.error('Error setting Employment Start Date:', error);
      }
    }

    await setEmploymentStartDate(jobData);

    // 8) Location

async function handleLocations(jobData) {
  try {
    // Validate input
    if (!jobData || typeof jobData.location !== 'string') {
      throw new Error('Invalid job data: location is required and must be a string');
    }

    const locationStr = jobData.location;
    const locations = locationStr.includes(',') 
      ? locationStr.split(',').map(loc => loc.trim()) 
      : [locationStr];

    for (const loc of locations) {
      // Skip empty locations
      if (!loc) continue;

      // ----- Main Location Input -----
      const locationsContainer = await waitForElement('div[data-cy-id="job-locations"]');
      const locationInput = locationsContainer.querySelector('input.v-field__input');
      
      locationInput.click();
      locationInput.value = loc + " uk";
      locationInput.dispatchEvent(new Event('input', { bubbles: true }));

      // Click search button to trigger modal
      const searchButton = locationsContainer.querySelector('button.v-btn');
      searchButton.click();

      console.log(`Main location search triggered for: "${loc}"`);
      await sleep(1000);

      // ----- Modal Handling -----
      const displayNameInput = await waitForElement('div.v-input__control input.v-field__input');
      displayNameInput.click();
      await sleep(500);

      // Click the "Add Location" button
      const addLocationButton = await waitForElement(
        'button.v-btn--slim.v-theme--dark.v-btn--density-default.v-btn--size-default.v-btn--variant-text.mt-3.bg-green'
        // 'button.v-btn v-btn--elevated v-btn--icon v-theme--light v-btn--density-default v-btn--size-default v-btn--variant-elevated mt-3 bg-green'
      );
      addLocationButton.click();

      console.log(`Location "${loc}" added`);
      await sleep(1000);

      // Clean up the location text after adding
      const addedLocationInputs = await document.querySelectorAll('input.v-field__input');
      for (const input of addedLocationInputs) {
        if (input.value.endsWith(', UK')) {
          const cleanLocation = input.value.replace(/, UK$/, '');
          input.value = cleanLocation;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          console.log(`Cleaned up location text: "${cleanLocation}"`);
        }
      }
    }

    console.log('✅ All locations processed successfully');
  } catch (error) {
    console.error('❌ Error processing locations:', error);
  }
}

// Call the function with the jobData object
await handleLocations(jobData);


    // ---------------------- //
    // 9) JOB TYPE SELECTION
    // ---------------------- //


    async function selectJobType(jobType) {
        try {
            console.log(` Selecting job type: ${jobType}`);
    
            // 1️Open the dropdown
            const jobTypeArrow = await waitForXPath('/html/body/div[1]/div/div/div[1]/div/main/div/div/div[2]/div/div[2]/div[6]/div/div[1]/div/div[1]/div/div[4]/i', 1000);
            console.log("Found job type arrow:", jobTypeArrow);
            jobTypeArrow.click();
            console.log("Clicked job type arrow.");
            await sleep(100);
            const jobTypeDropdown = await waitForElement('input[name="jobType"]', 1000);
            console.log("Found job type dropdown:", jobTypeDropdown);
            jobTypeDropdown.click();
            await sleep(100);
    
            // 2️ Match job type to its index in dropdown
            const jobTypeOptions = [ "Internship (1 Month+)", "Placement (10 Months+)", "Graduate Job", "Graduate Scheme", "Level 2 Apprenticeship", "Level 3 Apprenticeship", "Higher Level Apprenticeship", "Degree Apprenticeship", "School Leaver Programme", "Work Experience", "Insight/Vacation Scheme (< 4 Weeks)", "Insight Day" ];
            const lowerCaseJobType = jobType.toLowerCase();
    
            let targetIndex = jobTypeOptions.findIndex(option =>
                option.toLowerCase().startsWith(lowerCaseJobType.slice(0, 2))
            );
    
            if (targetIndex === -1) {
                console.warn(`Unknown job type: "${jobType}". Defaulting to first option.`);
                targetIndex = 0;
            }
    
            console.log(`Moving down ${targetIndex} times to select "${jobTypeOptions[targetIndex]}"`);
    
            // Press down key the required number of times
            for (let i = 0; i <= targetIndex; i++) {
                jobTypeDropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                await sleep(300);
            }
    
            // 4 Wait for the correct active option
            await sleep(500);
            let activeOption = document.querySelector('.v-list-item--active');
    
            if (!activeOption || !activeOption.innerText.includes(jobTypeOptions[targetIndex])) {
                console.warn(` No correct active option found, searching manually.`);
                
                // Manually find the correct job type
                const allOptions = Array.from(document.querySelectorAll('.v-list-item'));
                activeOption = allOptions.find(opt => opt.innerText.includes(jobTypeOptions[targetIndex]));
            }
    
            if (!activeOption) {
                throw new Error(` No job type option found in dropdown for "${jobType}"`);
            }

            // 5️⃣ Click the correct option
            console.log(` Clicking option: ${activeOption.innerText.trim()}`);
            activeOption.click();
            await sleep(500);

            // 6️⃣ Press ESC to close the dropdown
            console.log(" Pressing ESC to close job type dropdown...");
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await sleep(500);

    
            console.log(`✅ Job type selection completed.`);
    
        } catch (err) {
            console.error(" Error selecting job type:", err);
        }
    }
    
    // Call function inside `fillPlatformPage`
    await selectJobType(jobData.jobType);


    // // ---------------------- //
    // // 9) JOB TAGS
    // // ---------------------- //

    async function handleJobTags(tags) {
      try {
        const tagsInputSelector = 'div.v-autocomplete input';
        const tagsInput = await waitForElement(tagsInputSelector);
    
        // Scroll input into view
        tagsInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
        // Split and clean tags if they come as a comma-separated string
        const tagList = typeof tags === 'string' 
          ? tags.split(',').map(t => t.trim()).filter(Boolean)
          : Array.isArray(tags) 
            ? tags.flatMap(t => t.split(',').map(st => st.trim())).filter(Boolean)
            : [];
    
        for (const tag of tagList) {
          console.log(`Processing tag: ${tag}`);
    
          // Focus and click the input
          tagsInput.focus();
          tagsInput.click();
          await sleep(300);
    
          // Set the value and trigger necessary events
          tagsInput.value = tag;
          
          // Trigger proper input events
          tagsInput.dispatchEvent(new Event('input', { bubbles: true }));
          tagsInput.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Trigger a more realistic keydown event sequence
          for (const char of tag) {
            tagsInput.dispatchEvent(new KeyboardEvent('keydown', {
              key: char,
              code: `Key${char.toUpperCase()}`,
              bubbles: true
            }));
          }
          
          await sleep(500);
    
          // Wait for and verify dropdown
          const dropdownOptions = await waitForDropdownOptions();
          
          if (!dropdownOptions.length) {
            console.warn(`⚠️ No dropdown options found for tag: ${tag}`);
            continue;
          }
    
          // Find the best matching option
          const matchingOption = Array.from(dropdownOptions)
            .find(option => option.textContent.toLowerCase().includes(tag.toLowerCase()));
    
          if (matchingOption) {
            // Click the matching option directly
            matchingOption.click();
          } else {
            // Fallback to keyboard navigation
            tagsInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await sleep(200);
            tagsInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          }
    
          await sleep(500);
        }
    
        // Final click outside to ensure everything is confirmed
        document.body.click();
        
      } catch (e) {
        console.error(`❌ Error during job tag selection:`, e);
      }
    }
    
    // Helper function to wait for dropdown options
    async function waitForDropdownOptions(timeout = 5000) {
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const options = document.querySelectorAll('.v-list-item');
        if (options.length > 0) return options;
        await sleep(100);
      }
      
      return [];
    }
    
    // Usage
    await handleJobTags(jobData.tags);


    // UPDATE JOB BUTTON 

    async function handleJobUpdate() {
      try {
        // Look for the Update Job button with specific classes and text content
        const updateButton = await waitForElement(
          'button.v-btn--slim.v-theme--dark.bg-green span.v-btn__content',
          5000
        );
    
        if (!updateButton || !updateButton.textContent.trim().includes('Update Job')) {
          throw new Error('Update Job button not found');
        }
    
        // Click the parent button element
        const buttonElement = updateButton.closest('button');
        buttonElement.click();
        
        console.log('✅ Update Job button clicked successfully');
        await sleep(1000); // Wait for any post-update processes
        
        if (!window._alertOverridden) {
            window._alertOverridden = true;
            const originalAlert = window.alert;
            window.alert = function(message) {
                if (message && message.includes("There are validation errors on the current form")) {
                    console.warn("Validation error alert detected:", message);
                    debugger; // Break execution here for debugging
                }
                return originalAlert(message);
            };
        }
      } catch (error) {
        console.error('❌ Error clicking Update Job button:', error);
      }
    }
    
    // Usage:
    await handleJobUpdate();    

    // JOB DESCRIPTION

    async function navigateToContentTab() {
      try {
        // Find all tab buttons and look for the one with "Content" text
        const buttons = document.querySelectorAll('button.v-btn.v-tab');
        const contentButton = Array.from(buttons).find(button => 
          button.textContent.trim().includes('Content')
        );
    
        if (!contentButton) {
          throw new Error('Content tab button not found');
        }
    
        // Click the button
        contentButton.click();
        console.log('✅ Successfully clicked Content tab');
        await sleep(200); // Wait for tab content to load
    
      } catch (error) {
        console.error('❌ Error clicking Content tab:', error);
      }
    }
    
    // Usage
    await navigateToContentTab();    
    
    // // // PASTE JOB DESCRIPTION 
    async function setJobDescription(description) {
      try {
        // Find the editor div
        const editor = document.querySelector('#textEditor .ql-editor');
        if (!editor) {
          throw new Error('Editor element not found');
        }
        // Append the "How to apply" section to the description
        const fullDescription = `${description}\n\n<h3>How to apply</h3>To apply for this role and to find out more, please click on the apply button. Please note that applications may close before the application deadline, so apply early to avoid disappointment.`;
        // Set the content and remove the ql-blank class
        editor.innerHTML = fullDescription;
        editor.classList.remove('ql-blank');
        
        console.log('✅ Successfully set job description');
        // console.log('Job description:', fullDescription);
        await sleep(500); // Small delay to ensure content is set
    
      } catch (error) {
        console.error('❌ Error setting job description:', error);
      }
    }

        await setJobDescription(jobData.description);
        await handleJobUpdate(); 

        //---------------------------------------------------------
        // SETTING JOBS LIVE
        //---------------------------------------------------------

// Set job Live
async function setJobLiveFromContentPage() {
  try {
    console.log("🚀 Starting process to set job live from content page");

    // 1️⃣ Extract Job ID from current URL
    const url = window.location.href;
    const match = url.match(/\/jobs\/(\d+)/);
    if (!match || !match[1]) {
      console.error("❌ Could not extract Job ID from URL");
      return;
    }
    const jobId = match[1];
    window.jobId = jobId; // Save jobId globally
    console.log("✅ Extracted Job ID:", jobId);

    // 2️⃣ Click the "Campaigns" tab
    const campaignsTab = await waitForXPath('/html/body/div[1]/div/div/div[1]/div/div/div[3]/a[1]', 1000, el => el.innerText.trim() === "Campaigns");
    campaignsTab.click();
    console.log("✅ Clicked Campaigns tab");
    await sleep(1000);

    // 3️⃣ Click the campaign name link (first one)
    const campaignLink = await waitForElement("tbody.v-data-table__tbody td a[href*='campaigns']", 1000);
    campaignLink.click();
    console.log("✅ Clicked Campaign link");
    await sleep(2000);

    // 4️⃣ Expand the correct section (e.g., job list or settings)
    const expansionOverlay = await waitForElement(".v-expansion-panel-title__overlay", 1000);
    expansionOverlay.click();
    console.log("✅ Clicked expansion panel overlay");
  
  } catch (err) {
    console.error("❌ Error in setJobLiveFromContentPage:", err);
  }
}

// Utility sleep (already used in your project)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

await setJobLiveFromContentPage();

// SELECT JOB LISTING TAB

async function selectJobListingTab(jobType) {
  try {
    console.log("Selecting job listing tab for job type:", jobType);
    let tabText = "";
    
    // Use "startsWith" for graduate; "includes" for the others.
    if (jobType.startsWith("graduate")) {
      tabText = "Graduate Job Listing";
    } else if (jobType.includes("Apprenticeship") || jobType.includes("Internship") || jobType.includes("Placement")) {
      tabText = "Undergraduate Job Listing";
    } else if (jobType.includes("School") || jobType.includes("Leaver")) {
      tabText = "School Leaver Job Listing";
    } else {
      console.log(jobType);
      console.warn("Unknown job type. Defaulting to Graduate Job Listing.");
      tabText = "Graduate Job Listing";
    }
    
    console.log("Tab text determined:", tabText);

const serviceHeaders = Array.from(document.querySelectorAll(".ServiceHeader"))
.filter(header => header.querySelector(".unbooked"));

if (serviceHeaders.length === 0) {
console.warn("No ServiceHeader elements with class 'unbooked' found.");
} else {
console.log("Found", serviceHeaders.length, "ServiceHeader elements with class 'unbooked':");
serviceHeaders.forEach((header, index) => {
  // Get all spans in the header that are not marked as ServiceAttributes
  const spans = header.querySelectorAll("span:not(.ServiceAttributes)");
  const spanTexts = Array.from(spans)
    .map(span => span.innerText.trim())
    .filter(text => text.length > 0);
  console.log("ServiceHeader " + index + ":", spanTexts.join(" | "));
});
}

let found = false;
serviceHeaders.forEach(header => {
// Look for spans that might exactly match the target text
const spans = header.querySelectorAll("span:not(.ServiceAttributes)");
spans.forEach(span => {
  if (span.innerText && span.innerText.trim().toLowerCase() === tabText.toLowerCase()) {
    header.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    header.click();
    console.log("Clicked ServiceHeader with text:", span.innerText.trim());
    found = true;
  }
});
});
await sleep(500);
    if (!found) {
      console.error("Could not find a ServiceHeader with text containing:", tabText);
    }
  } catch (err) {
    console.error("Error selecting job listing tab:", err);
  }
}

// Example usage:
await selectJobListingTab(jobData.jobType);


// CAMPAIGN DROPDOWN AND DATES

async function setNewJobBooking(jobData) {
  try {
    const jobId = window.jobId;
    console.log("Starting setNewJobBooking with jobId:", jobId);
    await sleep(1000);
    const dropdownInput = document.querySelector('input[title="Open"]');
    if (!dropdownInput) {
      console.error('No input found with title="Open"');
      return;
    }

    // Scroll into view
    dropdownInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(1000);

    // Click it
    dropdownInput.click();
    await sleep(500);
    dropdownInput.click();
    dropdownInput.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    console.log('Clicked the input with title="Open"');

    // 3) Wait for .v-list-item to appear
    let dropdownOptions = document.querySelectorAll('.v-list-item');
    let attempts = 0;
    while (dropdownOptions.length === 0 && attempts < 5) {
      await sleep(500);
      dropdownOptions = document.querySelectorAll('.v-list-item');
      attempts++;
    }
    if (dropdownOptions.length === 0) {
      console.error("No dropdown items found for Select New Job.");
      return;
    }
    console.log("Found", dropdownOptions.length, "dropdown items in Select New Job.");

    // 4) Find the item that starts with jobId (e.g. "110016 - FINANCE INTERN") and click it with retry logic
    let targetItem = Array.from(dropdownOptions).find(item => item.innerText.trim().startsWith(jobId));
    if (targetItem) {
      targetItem.click();
      console.log("Selected item:", targetItem.innerText.trim());
    } else {
      console.warn("No dropdown item found on first attempt. Retrying...");
      window.click();
      await sleep(200);
      dropdownInput.click();
      await sleep(500);
      dropdownOptions = document.querySelectorAll('.v-list-item');
      targetItem = Array.from(dropdownOptions).find(item => item.innerText.trim().startsWith(jobId));
      
      if (targetItem) {
        targetItem.click();
        console.log("Selected item on retry:", targetItem.innerText.trim());
      } else {
        console.error("No dropdown item found that starts with Job ID:", jobId);
        return;
      }
    }
    await sleep(500);

    // 5) Set the start date to today using the label text approach
    // Find the label element that exactly matches "Start Date*"
    // const labels = document.querySelectorAll("label");
    // const startLabel = Array.from(labels).find(label => label.innerText && label.innerText.trim() === "Start Date*");

    // if (!startLabel) {
    //   console.error("Start Date* label not found.");
    //   return;
    // }
    // console.log("Found Start Date* label:", startLabel.innerText.trim());
    // // Click the label to open the date picker
    // startLabel.click();
    // console.log("Clicked Start Date* label.");
    // await sleep(500);

// 1. Find the exact label node:
const labels = Array.from(document.querySelectorAll("label"));
const startLabel = labels.find(label => {
  const txt = label.textContent.replace(/\u00A0/g, " ").trim();
  return txt === "Start Date*";
});

if (!startLabel) {
  console.error("Start Date* label not found.");
  return;
}

// 2. Get its “for” target (or fallback to the first <input> inside it):
let inputEl = null;
const forId = startLabel.getAttribute("for");
if (forId) {
  inputEl = document.getElementById(forId);
} 
if (!inputEl) {
  inputEl = startLabel.querySelector("input, div[v-input]"); 
  // adjust this selector to match your actual clickable element
}

if (!inputEl) {
  console.error("Couldn't locate the corresponding input for Start Date*.");
  return;
}

// 3. Finally click the input itself:
inputEl.click();
console.log("Clicked the Start Date* input only.");




    // Build today's date in "DD/MM/YYYY" format
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayStr = `${dd}/${mm}/${yyyy}`;

    // Call your existing selectDate() with the parsed date
    await selectDate(parseDDMMYYYY(todayStr));
    console.log("Selected today's date:", todayStr);
    await sleep(500);

    // 6) Set the end date to jobData.deadline
// 6) Set the end date to jobData.deadline using the label "End Date*"
const endDateLabel = await waitForLabelContaining("End Date*", 10000);
if (!endDateLabel) {
  console.error("End Date label not found.");
  return;
}
console.log("Found End Date label:", endDateLabel.innerText.trim());
endDateLabel.click();
console.log("Clicked End Date label.");
await sleep(500);

const parsedDeadline = parseDDMMYYYY(jobData.deadline);
if (!parsedDeadline || isNaN(parsedDeadline.getTime())) {
  // If deadline is null or invalid, set end date to 6 months from today
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  await selectDate(sixMonthsLater);
  console.log("Deadline was invalid or ongoing. Set end date to six months from today:", sixMonthsLater.toLocaleDateString());
} else {
  await selectDate(parsedDeadline);
  console.log("Selected end date:", jobData.deadline);
}
endDateLabel.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });


    console.log("Successfully selected new job, start date, and end date.");
    endDateLabel.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  } catch (err) {
    console.error("Error in setNewJobBooking:", err);
  }

  const savebtn = await waitForElement ('button.v-btn:nth-child(3)')
  // const savebtn = await waitForXPath('/html/body/div[1]/div/div/div[1]/div/main/div/div/div[2]/div/div/div[2]/div/div[2]/div[2]/div/div[10]/div[2]/div/div/div/div[2]/div/div/div[3]/button[2]/span[3]');
  if (!savebtn) {
    console.error("Save button not found.");
    return;
  }
  savebtn.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  savebtn.click();
  console.log("Clicked save button");
  await sleep(1000);
  // close the tab 
  console.log("closing the current tab.");
  window.close();
}


await setNewJobBooking(jobData);


// -------------------
// Utility Functions
// -------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseDDMMYYYY(dateStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split("/");
  if (!d || !m || !y) return null;
  return new Date(+y, +m - 1, +d);
}

async function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    (function check() {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - startTime > timeout) {
        return reject(new Error(`Timeout waiting for selector: ${selector}`));
      }
      requestAnimationFrame(check);
    })();
  });
}

async function waitForXPath(xpath, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    (function check() {
      const xpResult = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const el = xpResult.singleNodeValue;
      if (el) return resolve(el);
      if (Date.now() - startTime > timeout) {
        return reject(new Error(`Timeout waiting for XPath: ${xpath}`));
      }
      requestAnimationFrame(check);
    })();
  });
}

// Helper: Wait for a label element whose text contains the specified string
async function waitForLabelContaining(text, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    (function check() {
      const labels = document.querySelectorAll("label");
      for (const label of labels) {
        if (label.innerText && label.innerText.trim().includes(text)) {
          return resolve(label);
        }
      }
      if (Date.now() - startTime > timeout) {
        return reject(new Error("Timeout waiting for label containing: " + text));
      }
      requestAnimationFrame(check);
    })();
  });
}

// await setNewJobBooking(jobData);
        
    console.log("All primary fields filled!");
  } catch (err) {
    console.error("Error in fillPlatformPage:", err);
  }
}

// ----------------------
// Utility Functions
// ----------------------

async function selectDate(dateObj) {
    try {
      // 1) Click the date input
      const dateInput = await waitForElement('input[name="label"]', 300);
      dateInput.click();
      console.log("Clicked date input to open the calendar UI");
      await sleep(200);
  
      // 2) Click arrow for YEAR
      const arrowDrop = await waitForXPath('/html/body/div[2]/div/div/div/div[2]/div[1]/button[2]', 300);
      console.log("Found arrow_drop_down button:", arrowDrop);
      arrowDrop.click();
      await sleep(200);
  
      // 3) Year container
      const yearsContainer = await waitForElement('.v-date-picker-years__content', 300);
      console.log("Found the years container:", yearsContainer);
  
      const targetYearStr = String(dateObj.getFullYear());
      const allYearButtons = Array.from(yearsContainer.querySelectorAll('button'));
      const yearButton = allYearButtons.find(btn => btn.innerText.trim() === targetYearStr);
  
      if (!yearButton) {
        throw new Error(`Could not find a button for year: ${targetYearStr}`);
      }
      yearButton.click();
      console.log(`Selected year: ${targetYearStr}`);
      await sleep(200);
  
      // 4) Arrow for MONTH
      const monthArrowXPath = '/html/body/div[2]/div/div/div/div[2]/div[1]/button[1]';
      const monthArrowBtn = await waitForXPath(monthArrowXPath, 1000);
      monthArrowBtn.click();
      console.log("Clicked arrow to show month list");
      await sleep(200);
  
      // 5) monthsContainer
      const monthsContainer = await waitForElement('.v-date-picker-months__content', 300);
      console.log("Found months container:", monthsContainer);
  
      // Build target month name
      const monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const targetMonthName = monthsShort[dateObj.getMonth()];
  
      // Find the correct month button
      const allMonthBtns = Array.from(monthsContainer.querySelectorAll('button'));
      const monthBtn = allMonthBtns.find(b => {
        const span = b.querySelector('.v-btn__content');
        return span && span.textContent.trim() === targetMonthName;
      });
      if (!monthBtn) {
        throw new Error(`Could not find a button for month: ${targetMonthName}`);
      }
      monthBtn.click();
      console.log(`Selected month: ${targetMonthName}`);
      await sleep(300);
  
      // 6) Finally pick the day via text
      await selectDayByText(dateObj.getDate());
      console.log("Day selection completed!");
      await sleep(200);
  
    } catch (err) {
      console.error("Error selecting date:", err);
      throw err;
    }
  }
//     //---------------------------------------------------------
//     // DAY selection
//     //---------------------------------------------------------

async function selectDayByText(targetDay) {
    // 1) Wait for the days container
    const daysContainer = await waitForElement('.v-date-picker-month__days', 300);
    console.log("Found days container:", daysContainer);
  
    // 2) Gather all .v-date-picker-month__day elements
    const dayDivs = Array.from(daysContainer.querySelectorAll('.v-date-picker-month__day'));
  
    // 3) Convert targetDay to string
    const targetDayStr = String(targetDay);
  
    // 4) Find the correct day <div> that has <span> = day
    const matchingDayDiv = dayDivs.find(div => {
      const btnSpan = div.querySelector('.v-date-picker-month__day-btn .v-btn__content');
      return btnSpan && btnSpan.textContent.trim() === targetDayStr;
    });
  
    if (!matchingDayDiv) {
      throw new Error(`Could not find day div with text: ${targetDayStr}`);
    }
  
    // 5) Inside that day, there's a <button> we can click
    const buttonToClick = matchingDayDiv.querySelector('button');
    if (!buttonToClick) {
      throw new Error("No button found inside the matching day div!");
    }
  
    buttonToClick.click();
    console.log(`Selected day: ${targetDayStr}`);
    await sleep(500);
  }

// -------------------
// Utility Functions
// -------------------

/**
 * parseDDMMYYYY("31/12/2024") => new Date(2024, 11, 31)
 */
function parseDDMMYYYY(dateStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split("/");
  if (!d || !m || !y) return null;
  return new Date(+y, +m - 1, +d);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fillInput(inputEl, value) {
  inputEl.focus();
  inputEl.value = value;
  inputEl.dispatchEvent(new Event("input", { bubbles: true }));
  inputEl.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Wait for a CSS selector in the DOM
 */
function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    (function check() {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - startTime > timeout) {
        return reject(new Error(`Timeout waiting for selector: ${selector}`));
      }
      requestAnimationFrame(check);
    })();
  });
}

// /**
//  * waitForXPath - finds an element by XPATH
//  */
function waitForXPath(xpath, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    (function check() {
      const xpResult = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const el = xpResult.singleNodeValue;
      if (el) return resolve(el);
      if (Date.now() - startTime > timeout) {
        return reject(new Error(`Timeout waiting for XPATH: ${xpath}`));
      }
      requestAnimationFrame(check);
    })();
  });
}
