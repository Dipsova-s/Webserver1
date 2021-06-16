using AngleWarnings;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public class AngleWarningsAutoSolver : IAngleWarningsAutoSolver
    {
        private static List<AngleWarningFirstLevelViewmodel> _firstLevelWarnings;

        private readonly IModelService _modelService;
        private  SessionHelper _sessionHelper;

        private readonly IAngleWarningsContentInputter _contentInputter;

        public AngleWarningsAutoSolver(IModelService modelService, IAngleWarningsContentInputter angleWarningsContentInputter)
        {
            _modelService = modelService ?? throw new System.ArgumentNullException(nameof(modelService));
            _contentInputter = angleWarningsContentInputter ?? throw new System.ArgumentNullException(nameof(angleWarningsContentInputter));
        }

        public void Initialize(SessionHelper sessionHelper)
        {
            _sessionHelper = sessionHelper ?? throw new System.ArgumentNullException(nameof(sessionHelper));
        }

        public static void SetFirstLevelWarnings(JObject firstLevelWarnings)
        {
            _firstLevelWarnings = JsonConvert.DeserializeObject<List<AngleWarningFirstLevelViewmodel>>(firstLevelWarnings.SelectToken("data").ToString());
            _firstLevelWarnings = _firstLevelWarnings.Where(x => x.Count > 0).ToList();
        }

        public int GetNumberOfSolvableFieldsViaInputFile(DataSourceResult dataSource)
        {
            int result = 0;

            if (_contentInputter.TryReadInputList())
            {
                foreach (AngleWarningsViewModel angleViewModel in dataSource.Data)
                {
                    if (angleViewModel.DataFirstLevel.Count > 0)
                    {
                        string limitOffsetQueryString = UtilitiesHelper.GetOffsetLimitQueryString(1, _sessionHelper.SystemSettings.max_pagesize);
                        string requestUri = UrlHelper.GetRequestUrl(URLType.NOA) + angleViewModel.Uri + "&" + limitOffsetQueryString;
                        JObject angleWarningsResult = _modelService.GetAngleWarningSecondLevel(requestUri);

                        result += _contentInputter.CountFieldMatches(angleViewModel.DataFirstLevel.Id, angleWarningsResult);
                    }
                }
            }

            return result;
        }

        public string ExecuteAngleWarningsUsingInputFile(string modelId)
        {
            if (string.IsNullOrEmpty(modelId))
            {
                throw new System.ArgumentException("Modelid should be provided.", nameof(modelId));
            }

            if (!_contentInputter.TryReadInputList())
            {
                throw new System.Exception("Reading content input file failed.");
            }

            MainTaskModel mainTaskModel = new MainTaskModel(_sessionHelper.CurrentUser.Id);

            _firstLevelWarnings.ForEach(x => ConstructAngleWarningActions(mainTaskModel, x, modelId));

            return (mainTaskModel.Actions.Count > 0) ? mainTaskModel.GetJsonRequest() : "";
        }

        private void ConstructAngleWarningActions(MainTaskModel mainTaskModel, AngleWarningFirstLevelViewmodel level1AngleWarning, string modelId)
        {
            List<AngleWarningSecondLevelViewmodel> leve2AngleWarnings = GetLevel2Warnings(level1AngleWarning);

            LoopThroughSecondLevelWarnings(mainTaskModel, level1AngleWarning, leve2AngleWarnings, modelId);
        }

        private void LoopThroughSecondLevelWarnings(MainTaskModel mainTaskModel, AngleWarningFirstLevelViewmodel level1AngleWarning, List<AngleWarningSecondLevelViewmodel> leve2AngleWarnings, string modelId)
        {
            foreach (AngleWarningSecondLevelViewmodel level2AngleWarning in leve2AngleWarnings)
            {
                AngleWarningsContentInput contentInput = GetContentInput(level1AngleWarning.Id, level2AngleWarning);


                if (contentInput == null || contentInput.Fix == WarningFix.NotSupportedMethod)
                {
                    continue;
                }
                
                AngleWarningsTaskAction taskAction = AddActionArgument(level1AngleWarning.Id, level2AngleWarning, contentInput, modelId);

                List<AngleWarningThirdLevelViewmodel> level3AngleWarnings = GetLevel3Warnings(level2AngleWarning);
                level3AngleWarnings.ForEach(x => AddTargetIds(contentInput.Fix, taskAction, x));

                mainTaskModel.AddAction(taskAction);
            }
        }

        private AngleWarningsContentInput GetContentInput(string warning, AngleWarningSecondLevelViewmodel level2AngleWarning)
        {
            return _contentInputter.GetSolveItem(warning, level2AngleWarning.Object, level2AngleWarning.Field, level2AngleWarning.Jump);
        }

        private AngleWarningsTaskAction AddActionArgument(string warning, AngleWarningSecondLevelViewmodel level2AngleWarning, AngleWarningsContentInput contentInput, string modelId)
        {
            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelId);
            taskAction.AddActionArgument(level2AngleWarning.Field, contentInput, level2AngleWarning.Object, new string[] { warning });

            return taskAction;
        }

        private static void AddTargetIds(WarningFix warningFix, AngleWarningsTaskAction taskAction, AngleWarningThirdLevelViewmodel level3AngleWarning)
        {
            taskAction.AddTargetId(warningFix, level3AngleWarning.AngleId, level3AngleWarning.DisplayId);
        }

        private List<AngleWarningSecondLevelViewmodel> GetLevel2Warnings(AngleWarningFirstLevelViewmodel level1AngleWarning)
        {
            string limitOffsetQueryString = UtilitiesHelper.GetOffsetLimitQueryString(1, _sessionHelper.SystemSettings.max_pagesize);
            string requestUri = EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA) + level1AngleWarning.Uri + "&" + limitOffsetQueryString;
            var angleWarningsResult2 = _modelService.GetAngleWarningSecondLevel(requestUri);

            List<AngleWarningSecondLevelViewmodel> leve2AngleWarnings = JsonConvert.DeserializeObject<List<AngleWarningSecondLevelViewmodel>>(angleWarningsResult2.SelectToken("data").ToString());

            return leve2AngleWarnings;
        }

        private List<AngleWarningThirdLevelViewmodel> GetLevel3Warnings(AngleWarningSecondLevelViewmodel level2AngleWarning)
        {
            var angleWarningsResult3 = this._modelService.GetAngleWarningThirdLevel(level2AngleWarning.Uri);

            return JsonConvert.DeserializeObject<List<AngleWarningThirdLevelViewmodel>>(angleWarningsResult3.SelectToken("data").ToString());
        }

    }
}