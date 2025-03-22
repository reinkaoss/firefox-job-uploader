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
    const createBtn = await waitForElement('[data-cy-id="create-job"]', 15000);
    console.log("Found create-job button:", createBtn);
    createBtn.click();
    await sleep(2000);

    // 2) Fill job title
    const titleInput = await waitForElement('input[name="job-name-txt"]', 10000);
    fillInput(titleInput, jobData.title);
    console.log("Title filled with:", jobData.title);
    await sleep(1000);

    // 3) Submit "Create Job"
    const createJobSubmit = await waitForElement('[data-cy-id="create-job-submit"]', 10000);
    createJobSubmit.click();
    console.log("Clicked create job submit!");
    await sleep(3000);

    // // 4) Apply link
    // const applyLinkRadio = await waitForElement('input[type="radio"][value="redirect"]', 5000);
    // if (!applyLinkRadio.checked) {
    //   applyLinkRadio.click();
    //   console.log('Checked the "Apply Link" radio button');
    // }
    // await sleep(500);    

    // // 4.1) Apply link
    // const applyLinkInput = await waitForElement('input[name="jobRedirect"]', 10000);
    // fillInput(applyLinkInput, jobData.applyLink);
    // console.log("Apply link filled with:", jobData.applyLink);
    // await sleep(1000);

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
    const applyMethodRadio = await waitForElement(`input[type="radio"][value="${radioValue}"]`, 5000);
    
    if (!applyMethodRadio.checked) {
      applyMethodRadio.click();
      console.log(`Checked the "${useEmail ? 'Email Address' : 'Apply Link'}" radio button`);
    }
    await sleep(500);

    // Fill in the appropriate input field
    const inputName = useEmail ? 'mailtoLink' : 'jobRedirect';
    const applyInput = await waitForElement(`input[name="${inputName}"]`, 10000);
    fillInput(applyInput, applyValue);
    console.log(`${useEmail ? 'Email address' : 'Apply link'} filled with:`, applyValue);
    await sleep(1000);

  } catch (error) {
    console.error('❌ Error handling apply method:', error);
  }
};

// Call the function with the jobData
await handleApplyMethod(jobData);


    // 5) Ongoing Deadline => uncheck if needed
    const ongoingCheckbox = await waitForElement('input[type="checkbox"][name="ongoing"]', 5000);
    if (ongoingCheckbox.checked) {
      ongoingCheckbox.click();
      console.log('Unchecked the "Ongoing Deadline" checkbox');
    }
    await sleep(500);

    // 6) Open date picker and select the deadline date (DD/MM/YYYY)
    // e.g. jobData.deadline = "31/12/2024"
    const parsedDate = parseDDMMYYYY(jobData.deadline);
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      console.warn("Invalid or missing deadline date:", jobData.deadline, "Skipping date picker selection.");
    } else {
      await selectDate(parsedDate);
      await sleep(1000);
    }

    // 7) Salary/Benefits
    const benefitsInput = await waitForElement('input[name="benefits"]', 10000);
    fillInput(benefitsInput, jobData.salary);
    console.log("Salary filled with:", jobData.salary);
    await sleep(1000);

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
    
            // 1️⃣ Click the dropdown arrow to open it
            const dropdownArrow = await waitForElement("i.v-select__menu-icon", 5000);
            console.log("✅ Found dropdown arrow:", dropdownArrow);
            dropdownArrow.click();
            await sleep(700);
    
            // 2️⃣ Wait for the dropdown input field
            const dropdownInput = await waitForElement("input[name='salaryId']", 5000);
            console.log("✅ Dropdown input found:", dropdownInput);
            dropdownInput.focus();
            await sleep(500);
    
            // 3️⃣ Move down the required number of times
            console.log(`📌 Moving down ${targetIndex} times...`);
            for (let i = 0; i <= targetIndex; i++) {
                dropdownInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                await sleep(300);
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
            const jobTypeArrow = await waitForXPath('/html/body/div[1]/div/div/div[1]/div/main/div/div/div[2]/div/div[2]/div[6]/div/div[1]/div/div[1]/div/div[4]/i', 10000);
            console.log("Found job type arrow:", jobTypeArrow);
            jobTypeArrow.click();
            console.log("Clicked job type arrow.");
            await sleep(500);
            const jobTypeDropdown = await waitForElement('input[name="jobType"]', 10000);
            console.log("Found job type dropdown:", jobTypeDropdown);
            jobTypeDropdown.click();
            await sleep(500);
    
            // 2️ Match job type to its index in dropdown
            const jobTypeOptions = [ "Internship (1 Month+)", "Placement (10 Months+)", "Graduate Job", "Graduate Scheme", "Level 2 Apprenticeship", "Level 3 Apprenticeship", "Higher Apprenticeship", "Degree Apprenticeship", "School Leaver Programme", "Work Experience", "Insight/Vacation Scheme (< 4 Weeks)", "Insight Day" ];
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
        await sleep(1000); // Wait for tab content to load
    
      } catch (error) {
        console.error('❌ Error clicking Content tab:', error);
      }
    }
    
    // Usage
    await navigateToContentTab();    
    
    // PASTE JOB DESCRIPTION 
    async function setJobDescription(description) {
      try {
        // Find the editor div
        const editor = document.querySelector('.ql-editor');
        if (!editor) {
          throw new Error('Editor element not found');
        }
    
        // Append the "How to apply" section to the description
        const fullDescription = `${description}\n\n<h3>How to apply</h3>To apply for this role and to find out more, please click on the apply button.\n\nPlease note that applications may close before the application deadline, so apply early to avoid disappointment.`;
    
        // Set the content and remove the ql-blank class
        editor.innerHTML = fullDescription;
        editor.classList.remove('ql-blank');
        
        console.log('✅ Successfully set job description');
        await sleep(500); // Small delay to ensure content is set
    
      } catch (error) {
        console.error('❌ Error setting job description:', error);
      }
    }

        // Usage
        await setJobDescription(jobData.description);
        await handleJobUpdate(); 

    // SAVE URL VALUES
    async function extractPreviewLinks() {
      try {
          const previewButtons = document.querySelectorAll('.preview-button');
          let previewUrls = [];
  
          previewButtons.forEach(button => {
              previewUrls.push(button.href);
          });
  
          if (previewUrls.length > 0) {
              console.log("Extracted preview URLs:", previewUrls);
  
              // Send preview URLs back to the extension
              chrome.runtime.sendMessage({ action: "storePreviewUrls", urls: previewUrls });
          }
  
      } catch (err) {
          console.error("Error extracting preview links:", err);
      }
  }
  
  extractPreviewLinks();
  

    
    console.log("All primary fields filled!");
  } catch (err) {
    console.error("Error in fillPlatformPage:", err);
  }
}

async function selectDate(dateObj) {
    try {
      // 1) Click the date input
      const dateInput = await waitForElement('input[name="label"]', 5000);
      dateInput.click();
      console.log("Clicked date input to open the calendar UI");
      await sleep(1000);
  
      // 2) Click arrow for YEAR
      const arrowDrop = await waitForXPath('/html/body/div[2]/div/div/div/div[2]/div[1]/button[2]', 5000);
      console.log("Found arrow_drop_down button:", arrowDrop);
      arrowDrop.click();
      await sleep(1000);
  
      // 3) Year container
      const yearsContainer = await waitForElement('.v-date-picker-years__content', 5000);
      console.log("Found the years container:", yearsContainer);
  
      const targetYearStr = String(dateObj.getFullYear());
      const allYearButtons = Array.from(yearsContainer.querySelectorAll('button'));
      const yearButton = allYearButtons.find(btn => btn.innerText.trim() === targetYearStr);
  
      if (!yearButton) {
        throw new Error(`Could not find a button for year: ${targetYearStr}`);
      }
      yearButton.click();
      console.log(`Selected year: ${targetYearStr}`);
      await sleep(1000);
  
      // 4) Arrow for MONTH
      const monthArrowXPath = '/html/body/div[2]/div/div/div/div[2]/div[1]/button[1]';
      const monthArrowBtn = await waitForXPath(monthArrowXPath, 5000);
      monthArrowBtn.click();
      console.log("Clicked arrow to show month list");
      await sleep(500);
  
      // 5) monthsContainer
      const monthsContainer = await waitForElement('.v-date-picker-months__content', 5000);
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
      await sleep(1000);
  
      // 6) Finally pick the day via text
      await selectDayByText(dateObj.getDate());
      console.log("Day selection completed!");
      await sleep(500);
  
    } catch (err) {
      console.error("Error selecting date:", err);
      throw err;
    }
  }
    //---------------------------------------------------------
    // DAY selection
    //---------------------------------------------------------

async function selectDayByText(targetDay) {
    // 1) Wait for the days container
    const daysContainer = await waitForElement('.v-date-picker-month__days', 5000);
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

    //----------------------
    // Job Type
    // ----------------------


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

/**
 * waitForXPath - finds an element by XPATH
 */
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
