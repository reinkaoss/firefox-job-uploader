
console.log("Content script loaded on this page:", window.location.href);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractJobs") {
    console.log("Received 'extractJobs' request. Expanding job cards...");

    // 1) Click all "Show More" buttons to expand job cards
    const expandButtons = document.querySelectorAll(".job-card-actions button.action-button");
    expandButtons.forEach((button) => {
      if (button.textContent.trim().toLowerCase() === "show more") {
        button.click();
      }
    });

    // 2) Poll for 'collapse' to confirm expansion is done
    const timer = setInterval(() => {
      const collapseButtons = document.querySelectorAll(".job-card-actions button.action-button");
      let allCollapsed = true;

      collapseButtons.forEach((button) => {
        if (button.textContent.trim().toLowerCase() === "collapse") {
          // We assume once we see "collapse," it's expanded enough to parse
          button.click();
          allCollapsed = true;
        }
      });

      if (allCollapsed) {
        clearInterval(timer);
        console.log("All job cards expanded/collapsed. Gathering data...");

        // 3) Gather all job data
        const jobCards = document.querySelectorAll(".job-card");
        const jobsData = [];

        jobCards.forEach((card) => {
          // Extract each placeholder-based field
          const title     = card.querySelector('input[placeholder="Job Title"]')?.value || "";
          const company   = card.querySelector('input[placeholder="Company Name"]')?.value || "";
          const location  = card.querySelector('input[placeholder="Location"]')?.value || "";
          const salary    = card.querySelector('input[placeholder="Salary"]')?.value || "";
          const jobType   = card.querySelector('input[placeholder="Job Type"]')?.value || "";
          const applyLink = card.querySelector('input[placeholder="Apply Link"]')?.value || "";
          const regions   = card.querySelector('input[placeholder="Regions"]')?.value || "";
          const JD        = card.querySelector('textarea[placeholder="Job Description"]')?.value || "";
          const deadline  = card.querySelector('input[placeholder="Application Deadline"]')?.value || "";
          const tags      = card.querySelector('input[placeholder="Tags"]')?.value || "";
          const description = card.querySelector('textarea[placeholder="Job Description"]')?.value || "";

          jobsData.push({
            title,
            company,
            location,
            salary,
            jobType,
            applyLink,
            regions,
            JD,
            deadline,
            tags,
            description
          });
        });

        console.log("Sending back jobsData to extension:", jobsData);
        sendResponse({ jobs: jobsData });
      }
    }, 1000);

    // Return true so we can respond asynchronously
    return true;
  }
});

