*** Variables ***
${btnAddNewTasks}              css=#mainContent > div > div.contentSection.contentSectionGrid.contentSectionGridTasks > div > a
${gridTaskRoleContainEvent}    jquery=#TasksGrid > div.k-grid-content > table:contains(event)

${trRowTaskGrid}               jquery=#TaskDetailsGridContainer tbody tr
${btnSubmitTask}               css=#popupCopyTask .btnSubmit
${btnCloseTask}                css=#popupCopyTask .btnClose
${btnDeleteTask}               .btnGroupInner .btnDelete
${btnSaveDeleteTask}           css=#popupConfirmation .btnSubmit

*** Keywords ***
Wait All Tasks Page Ready
      Wait Until Page Contains    Automation tasks
      Wait MC Progress Bar Closed

#Create New Task
Click Button To Add New Task
    Click Element    ${btnAddNewTasks}
    Wait MC Progress Bar Closed

Create Task By Copy Task
    [Arguments]    ${taskName}    ${newTaskName}
    Click Edit Task Action By Task Name    ${taskName}
    Click Copy Task Action By Task Name    ${taskName}
    Fill in Task Name    ${newTaskName}
    Click OK Copy Task

Click Delete Task Action By Task Name
    [Arguments]    ${taskName}
    Click Action In Grid By Name     ${taskName}    ${trRowTaskGrid}    ${btnDeleteTask}
    Wait Until Page Contains    Confirmation
    Confirm Delete Task

Confirm Delete Task
    Click Element    ${btnSaveDeleteTask}     
    Wait MC Progress Bar Closed

Click OK Copy Task
    Click Element    ${btnSubmitTask}
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete

Click Cancel Copy Task
    Click Element    ${btnCloseTask} 

