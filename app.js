const organization = "hack24ADO";
const project = "Skype";
const projectId = "88b7809a-433c-46d1-ae39-f4b4739811f9" //TODO fetch from context later
const team = "Skype Team";
const teamId = "a42c17c7-f721-4ac9-8913-1cb2db8ebd3c"; //TODO fetch from context later
const iterationPath = "your-project\\Sprint 1"; // Replace with your iteration
const token = "43g73fnijre7bwyltr2gygitzajshwn4n5u5drby4i4jozbykbma" //TODO use managed identity later

async function getWorkItemsForBacklog() {
    const areaPaths = await getAreaPathsForTeam(teamId);
    const areaPathsQuery = areaPaths.map(path => `'${path}'`).join(', ');
    const workItemQuery = {
        query: `SELECT [System.Id], [System.WorkItemType], [System.Title], [System.AssignedTo], [System.State] 
                FROM WorkItems 
                WHERE [System.AreaPath] IN (${areaPathsQuery})
                ORDER BY [Microsoft.VSTS.Common.Priority] ASC`
    };

    try {
        const response = await fetch(`https://dev.azure.com/${organization}/${project}/_apis/wit/wiql?api-version=7.1-preview.2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(':' + `${token}`)
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
                'Authorization': 'Basic ' + btoa(':' + `${token}`)
            }
        });

        const details = await detailsResponse.json();
        return details.value;
    } catch (error) {
        console.error("Error fetching work item details:", error);
    }
}

async function getAreaPathsForTeam(teamId){
    try {
        const detailsResponse = await fetch(`https://dev.azure.com/${organization}/${projectId}/${teamId}/_apis/work/teamsettings/teamfieldvalues?api-version=7.1-preview.1`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(':' + `${token}`)
            }
        });

        const details = await detailsResponse.json();
        const areas =  details.values.map(v => v.value);
        return areas;
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