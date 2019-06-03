using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ITaskService
    {
        // tasks
        List<TaskViewModel> GetTasks(string tasksUri);
        TaskViewModel CreateTask(string taskUri, TaskViewModel model);
        TaskViewModel UpdateTask(TaskViewModel model);
        TaskViewModel UpdateTask(TaskViewModel model, bool includeTaskAction);
        void DeleteTask(string taskUri);

        // task actions
        TaskAction CreateTaskAction(string taskActionUri, TaskAction model);
        TaskAction UpdateTaskAction(TaskAction model);
        void DeleteTaskAction(string taskActionUri);

        // history
        ListViewModel<TaskHistoryViewModel> GetTaskHistories(string taskHistoriesUri);
        TaskHistoryViewModel GetTaskHistory(string taskHistoryUri);

        // action list
        List<ActionListViewModel> GetActionList(string actionListUri);
    }
}
