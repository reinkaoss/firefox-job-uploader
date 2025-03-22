// document.getElementById("extractOpenTabsBtn").addEventListener("click", () => {
//     // Identify the active tab (the page with .job-card)
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       const activeTabId = tabs[0].id;
//       console.log("Requesting 'extractJobs' from tab:", activeTabId);
  
//       // Send message to content-script to gather all jobs
//       chrome.tabs.sendMessage(activeTabId, { action: "extractJobs" }, (response) => {
//         if (chrome.runtime.lastError) {
//           console.error("Error extracting jobs:", chrome.runtime.lastError.message);
//           return;
//         }
//         if (!response || !response.jobs) {
//           console.log("No jobs data returned or an error occurred.");
//           return;
//         }
  
//         console.log("Got jobs from content script:", response.jobs);
  
//         // For each job, open a new tab to the platform page
//         response.jobs.forEach((job, index) => {
//           const platformUrl = "https://qa2-portal.qa.higherin.com/app#/higherin/companies/3/jobs";
//           console.log(`Opening new tab for job #${index}:`, job.title);
  
//           chrome.tabs.create({ url: platformUrl }, (newTab) => {
//             console.log("New tab created for:", job.title, newTab);
  
//             // Listen for the tab to finish loading
//             chrome.tabs.onUpdated.addListener(function tabListener(tabId, info) {
//               if (tabId === newTab.id && info.status === "complete") {
//                 chrome.tabs.onUpdated.removeListener(tabListener);
  
//                 // Inject platformFiller.js
//                 chrome.scripting.executeScript({
//                   target: { tabId: newTab.id },
//                   files: ["platformFiller.js"]
//                 }, () => {
//                   console.log("Injected platformFiller.js into:", newTab.id);
  
//                   // Send a message to fill with this job's data
//                   chrome.tabs.sendMessage(newTab.id, {
//                     action: "fillPlatformPage",
//                     jobData: job
//                   });
//                 });
//               }
//             });
//           });
//         });
//       });
//     });
//   });

document.getElementById("extractOpenTabsBtn").addEventListener("click", () => {
  // Identify the active tab (the page with .job-card)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTabId = tabs[0].id;
    console.log("Requesting 'extractJobs' from tab:", activeTabId);

    // Send message to content-script to gather all jobs
    chrome.tabs.sendMessage(activeTabId, { action: "extractJobs" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error extracting jobs:", chrome.runtime.lastError.message);
        return;
      }
      if (!response || !response.jobs) {
        console.log("No jobs data returned or an error occurred.");
        return;
      }

      console.log("Got jobs from content script:", response.jobs);

      // For each job, open a new tab to the platform page
      response.jobs.forEach((job, index) => {
        const platformUrl = document.getElementById("platformUrl").value;
        console.log(`Opening new tab for job #${index}:`, job.title);

        chrome.tabs.create({ url: platformUrl }, (newTab) => {
          console.log("New tab created for:", job.title, newTab);

          // Listen for the tab to finish loading
          chrome.tabs.onUpdated.addListener(function tabListener(tabId, info) {
            if (tabId === newTab.id && info.status === "complete") {
              chrome.tabs.onUpdated.removeListener(tabListener);

              // Inject platformFiller.js
              chrome.scripting.executeScript({
                target: { tabId: newTab.id },
                files: ["platformFiller.js"]
              }, () => {
                console.log("Injected platformFiller.js into:", newTab.id);

                // Send a message to fill with this job's data
                chrome.tabs.sendMessage(newTab.id, {
                  action: "fillPlatformPage",
                  jobData: job
                });
              });
            }
          });
        });
      });
    });
  });
});

