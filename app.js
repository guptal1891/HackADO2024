const organization = "hack24ADO";
const project = "skype";
const team = "skype Team";
const iterationPath = "your-project\\Sprint 1"; // Replace with your iteration

async function getWorkItemsForBacklog() {
    const workItemQuery = {
        query: `SELECT [System.Id], [System.WorkItemType], [System.Title], [System.AssignedTo], [System.State] 
                FROM WorkItems 
                ORDER BY [Microsoft.VSTS.Common.Priority] ASC`
    };

    try {
        const response = await fetch(`https://dev.azure.com/${organization}/${project}/_apis/wit/wiql?api-version=6.0`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(':' + 'ccdtegvmj43rzbcljkp5s3lsfibydb27qodpqwu5egelrp3itbna')
            },
            body: JSON.stringify(workItemQuery)
        });

        const result = await response.json();
        return result.workItems;
    } catch (error) {
        console.error("Error fetching work items:", error);
    }
}

async function getWorkItemDetails(ids) {
    try {
        const idsString = ids.join(",");
        const detailsResponse = await fetch(`https://dev.azure.com/${organization}/${project}/_apis/wit/workitems?ids=${idsString}&api-version=6.0`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(':' + 'ccdtegvmj43rzbcljkp5s3lsfibydb27qodpqwu5egelrp3itbna')
            }
        });

        const details = await detailsResponse.json();
        return details.value;
    } catch (error) {
        console.error("Error fetching work item details:", error);
    }
}

async function renderWorkItems() {
    const workItems = await getWorkItemsForBacklog();

    if (!workItems || workItems.length === 0) {
        console.error("No work items found for this backlog.");
        return;
    }

    const workItemIds = workItems.map(wi => wi.id);
    const workItemDetails = await getWorkItemDetails(workItemIds);

    const workItemGrid = document.getElementById("workItemGrid");
    workItemGrid.innerHTML = ""; // Clear existing content

    workItemDetails.forEach(item => {
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");

        // Work Item Title
        const title = document.createElement("h3");
        title.textContent = item.fields["System.Title"];
        gridItem.appendChild(title);

        // Work Item Type
        const type = document.createElement("p");
        type.textContent = `Type: ${item.fields["System.WorkItemType"]}`;
        gridItem.appendChild(type);

        // State
        const state = document.createElement("p");
        state.textContent = `State: ${item.fields["System.State"]}`;
        gridItem.appendChild(state);

        // Assigned To
        const assignedTo = document.createElement("p");
        if (item.fields["System.AssignedTo"]) {
            assignedTo.textContent = `Assigned To: ${item.fields["System.AssignedTo"].displayName}`;
        } else {
            assignedTo.textContent = "Assigned To: Unassigned";
        }
        gridItem.appendChild(assignedTo);

        workItemGrid.appendChild(gridItem);
    });
}

renderWorkItems();