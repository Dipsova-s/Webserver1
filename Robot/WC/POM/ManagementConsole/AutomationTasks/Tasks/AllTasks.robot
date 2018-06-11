*** Variables ***
${btnAddNewTasks}     css=#mainContent > div > div.contentSection.contentSectionGrid.contentSectionGridTasks > div > a
${gridTaskRoleContainEvent}    jquery=#TasksGrid > div.k-grid-content > table:contains(event)

*** Keywords ***
Wait All Tasks Page Ready
      Wait Until Page Contains    Automation tasks
      Wait MC Progress Bar Closed

Click Button To Add New Task
    Click Element    ${btnAddNewTasks}
    Wait MC Progress Bar Closed
