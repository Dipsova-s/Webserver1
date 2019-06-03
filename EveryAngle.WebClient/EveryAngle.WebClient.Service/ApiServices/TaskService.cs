using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class TaskService : BaseService, ITaskService
    {
        #region Constant

        private const string ATTRIBUTE_TASKS = "tasks";
        private const string ATTRIBUTE_TASKHIROTIES = "event_log";

        #endregion

        #region Private variable

        // remove those properties on create/update task
        readonly List<string> defaultCleanTaskProperties = new List<string>
        {
            "id", "uri", "description",
            "created", "changed", "status",
            "RefreshCycleTrigger",
            "Model", "model", "Delta", "ActionList", "action_count",
            "Angle_Id", "Angle", "AngleName", "DisplayName",
            "Datastore", "SpecifyTables",
            "ConditionMinimumRows", "ConditionMaximumRows",
            "last_run_result", "last_run_time", "next_run_time"
        };

        // remove those properties on create/update task action
        readonly List<string> defaultCleanTaskActionProperties = new List<string>
        {
            "Angle", "AngleName", "DisplayName", "run_as_user"
        };

        #endregion

        #region Public method

        #region Task

        public override string GetUri(object model)
        {
            Type modelType = model.GetType();
            if (modelType.Equals(typeof(TaskAction)))
                return ((TaskAction)model).Uri.AbsolutePath.Remove(0, 1);
            else
                return ((TaskViewModel)model).Uri.AbsolutePath.Remove(0, 1);
        }

        public List<TaskViewModel> GetTasks(string tasksUri)
        {
            return GetItems<TaskViewModel>(tasksUri, ATTRIBUTE_TASKS).ToList();
        }

        public TaskViewModel CreateTask(string taskUri, TaskViewModel model)
        {
            return Create<TaskViewModel>(taskUri, model, defaultCleanTaskProperties);
        }

        /// <summary>
        /// Save task including actions
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public TaskViewModel UpdateTask(TaskViewModel model)
        {
            return UpdateTask(model, true);
        }
        /// <summary>
        /// Save task
        /// </summary>
        /// <param name="model"></param>
        /// <param name="includeTaskActions">Save actions with task or not?</param>
        /// <returns></returns>
        public TaskViewModel UpdateTask(TaskViewModel model, bool includeTaskAction)
        {
            List<string> cleanUpdateTaskProperties = new List<string>(defaultCleanTaskProperties);

            // additional removing properties on update task
            if (!includeTaskAction)
                cleanUpdateTaskProperties.Add("actions");

            return Update<TaskViewModel>(model, cleanUpdateTaskProperties);
        }

        public void DeleteTask(string taskUri)
        {
            Delete(taskUri);
        }

        #endregion

        #region Task action

        public TaskAction CreateTaskAction(string taskActionUri, TaskAction model)
        {
            return Create<TaskAction>(taskActionUri, model, defaultCleanTaskActionProperties);
        }

        public TaskAction UpdateTaskAction(TaskAction model)
        {
            return Update<TaskAction>(model, defaultCleanTaskActionProperties);
        }

        public void DeleteTaskAction(string taskActionUri)
        {
            Delete(taskActionUri);
        }

        #endregion

        #region TaskHistory

        public ListViewModel<TaskHistoryViewModel> GetTaskHistories(string taskHistoriesUri)
        {
            return GetPagableItems<TaskHistoryViewModel>(taskHistoriesUri, ATTRIBUTE_TASKHIROTIES);
        }

        public TaskHistoryViewModel GetTaskHistory(string taskHistoryUri)
        {
            return Get<TaskHistoryViewModel>(taskHistoryUri);
        }

        #endregion

        #region ActionList

        public List<ActionListViewModel> GetActionList(string actionListUri)
        {
            // order by name for using in dropdown list
            return GetArrayItems<ActionListViewModel>(actionListUri)
                .OrderBy(o => o.name).ToList();
        }

        #endregion

        #endregion
    }
}
