// ORIGINAL CODE


// document.getElementById("extractOpenTabsBtn").addEventListener("click", () => {
//   // Identify the active tab (the page with .job-card)
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const activeTabId = tabs[0].id;
//     console.log("Requesting 'extractJobs' from tab:", activeTabId);

//     // Send message to content-script to gather all jobs
//     chrome.tabs.sendMessage(activeTabId, { action: "extractJobs" }, (response) => {
//       if (chrome.runtime.lastError) {
//         console.error("Error extracting jobs:", chrome.runtime.lastError.message);
//         return;
//       }
//       if (!response || !response.jobs) {
//         console.log("No jobs data returned or an error occurred.");
//         return;
//       }

//       console.log("Got jobs from content script:", response.jobs);

//       // For each job, open a new tab to the platform page
//       response.jobs.forEach((job, index) => {
//         const platformUrl = document.getElementById("platformUrl").value;
//         console.log(`Opening new tab for job #${index}:`, job.title);

//         chrome.tabs.create({ url: platformUrl }, (newTab) => {
//           console.log("New tab created for:", job.title, newTab);

//           // Listen for the tab to finish loading
//           chrome.tabs.onUpdated.addListener(function tabListener(tabId, info) {
//             if (tabId === newTab.id && info.status === "complete") {
//               chrome.tabs.onUpdated.removeListener(tabListener);

//               // Inject platformFiller.js
//               chrome.scripting.executeScript({
//                 target: { tabId: newTab.id },
//                 files: ["platformFiller.js"]
//               }, () => {
//                 console.log("Injected platformFiller.js into:", newTab.id);

//                 // Send a message to fill with this job's data
//                 chrome.tabs.sendMessage(newTab.id, {
//                   action: "fillPlatformPage",
//                   jobData: job
//                 });
//               });
//             }
//           });
//         });
//       });
//     });
//   });
// });
document.getElementById("extractOpenTabsBtn").addEventListener("click", () => {
  // Identify the active tab (the page with .job-card)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTabId = tabs[0].id;
    console.log("Requesting 'extractJobs' from tab:", activeTabId);

    // Send message to content-script to gather all jobs
    chrome.tabs.sendMessage(activeTabId, { action: "extractJobs" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error extracting jobs:", chrome.runtime.lastError.message);
        return;
      }
      if (!response || !response.jobs) {
        console.log("No jobs data returned or an error occurred.");
        return;
      }

      console.log("Got jobs from content script:", response.jobs);

      // Process jobs sequentially
      for (const [index, job] of response.jobs.entries()) {
        const platformUrl = document.getElementById("platformUrl").value;
        console.log(`Opening new tab for job #${index}:`, job.title);
        try {
          await processJob(job, platformUrl);
          console.log(`Finished processing job '${job.title}'. Moving to the next one.`);
        } catch (err) {
          console.error(`Error processing job '${job.title}':`, err);
        }
      }
    });
  });
});

/**
 * Opens a new tab for the job, injects the filler script, sends the job data,
 * and waits for the tab to be closed before resolving.
 */
function processJob(job, platformUrl) {
  return new Promise((resolve, reject) => {
    // Create the new tab with the provided platform URL
    chrome.tabs.create({ url: platformUrl }, (newTab) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      console.log("New tab created for:", job.title, newTab);

      // Listen for the tab to finish loading
      chrome.tabs.onUpdated.addListener(function tabUpdatedListener(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(tabUpdatedListener);

          // Inject platformFiller.js into the new tab
          chrome.scripting.executeScript(
            {
              target: { tabId: newTab.id },
              files: ["platformFiller.js"]
            },
            () => {
              if (chrome.runtime.lastError) {
                console.error("Script injection error:", chrome.runtime.lastError.message);
                return reject(chrome.runtime.lastError);
              }
              console.log("Injected platformFiller.js into tab:", newTab.id);

              // Send the job data to fill the platform page
              chrome.tabs.sendMessage(newTab.id, { action: "fillPlatformPage", jobData: job }, () => {
                console.log(`Sent fillPlatformPage message for job '${job.title}' to tab ${newTab.id}.`);

                // Check if the tab is still open; if not, resolve immediately
                chrome.tabs.get(newTab.id, (tab) => {
                  if (chrome.runtime.lastError || !tab) {
                    console.log(`Tab for job '${job.title}' is already closed.`);
                    resolve();
                  } else {
                    // Listen for the tab to be closed
                    chrome.tabs.onRemoved.addListener(function removedListener(closedTabId) {
                      if (closedTabId === newTab.id) {
                        chrome.tabs.onRemoved.removeListener(removedListener);
                        console.log(`Tab for job '${job.title}' closed.`);
                        resolve();
                      }
                    });
                  }
                });
              });
            }
          );
        }
      });
    });
  });
}