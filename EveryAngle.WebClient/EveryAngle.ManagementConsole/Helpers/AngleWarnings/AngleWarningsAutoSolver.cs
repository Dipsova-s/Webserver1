using AngleWarnings;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Logging;
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
        private static ModelViewModel _model;

        private readonly IModelService _modelService;
        private  SessionHelper _sessionHelper;

        // To minimize appserver requests
        private Dictionary<string, List<FollowupViewModel>> _cachedFollowUps;
        private Dictionary<string, FieldViewModel> _cachedFields;
        private Dictionary<string, List<string>> _cachedClasses;

        private readonly IAngleWarningsContentInputter _contentInputter;

        public AngleWarningsAutoSolver(IModelService modelService, IAngleWarningsContentInputter angleWarningsContentInputter)
        {
            _modelService = modelService ?? throw new System.ArgumentNullException(nameof(modelService));
            _contentInputter = angleWarningsContentInputter ?? throw new System.ArgumentNullException(nameof(angleWarningsContentInputter));
        }

        public void Initialize(SessionHelper sessionHelper)
        {
            _sessionHelper = sessionHelper ?? throw new System.ArgumentNullException(nameof(sessionHelper));

            _cachedFollowUps = new Dictionary<string, List<FollowupViewModel>>();
            _cachedFields = new Dictionary<string, FieldViewModel>();
            _cachedClasses = new Dictionary<string, List<string>>();
        }

        public static void SetFirstLevelWarnings(JObject firstLevelWarnings)
        {
            _firstLevelWarnings = JsonConvert.DeserializeObject<List<AngleWarningFirstLevelViewmodel>>(firstLevelWarnings.SelectToken("data").ToString());
            _firstLevelWarnings = _firstLevelWarnings.Where(x => x.Count > 0).ToList();
        }

        public static void SetModel(ModelViewModel model)
        {
            _model = model;
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

                        result += CountFieldMatches(angleViewModel.DataFirstLevel.Id, angleWarningsResult);
                    }
                }
            }

            return result;
        }

        private int CountFieldMatches(string warning, JObject angleWarningsResult)
        {
            int result = 0;

            List<AngleWarningSecondLevelViewmodel> secondLevels = JsonConvert.DeserializeObject<List<AngleWarningSecondLevelViewmodel>>(angleWarningsResult.SelectToken("data").ToString());

            _contentInputter.Initialize(_model.FieldsourcesUri.ToString(), _model.ClassesUri.ToString());
            
            foreach (AngleWarningSecondLevelViewmodel secondLevel in secondLevels)
            {
                ItemSolver solveItem = _contentInputter.GetSolveItem(warning, secondLevel.Object, secondLevel.Field, secondLevel.Jump);

                if (EntityExistsInModel(solveItem))
                {
                    result += secondLevel.Count;
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

            _contentInputter.Initialize(_model.FieldsourcesUri.ToString(), _model.ClassesUri.ToString());

            // Example request: https://nl-dennis.eatestad.local:60010/models/1/angle_warnings/summary?include_public=true&include_private=true&include_validated=true&include_angles=true&include_templates=false&created_by=&offset=0&limit=1000
            _firstLevelWarnings.ForEach(x => ConstructAngleWarningActions(mainTaskModel, x, modelId));
            
            return (mainTaskModel.Actions.Count > 0) ? mainTaskModel.GetJsonRequest() : "";
        }

        private void ConstructAngleWarningActions(MainTaskModel mainTaskModel, AngleWarningFirstLevelViewmodel level1AngleWarning, string modelId)
        {
            // Example request:: https://nl-dennis.eatestad.local:60010//models/1/angle_warnings/unsupported_display_field?include_public=true&include_private=true&include_validated=true&include_angles=true&include_templates=false
            
            List<AngleWarningSecondLevelViewmodel> leve2AngleWarnings = GetLevel2Warnings(level1AngleWarning);

            LoopThroughSecondLevelWarnings(mainTaskModel, level1AngleWarning, leve2AngleWarnings, modelId);
        }

        private void LoopThroughSecondLevelWarnings(MainTaskModel mainTaskModel, AngleWarningFirstLevelViewmodel level1AngleWarning, List<AngleWarningSecondLevelViewmodel> leve2AngleWarnings, string modelId)
        {
            foreach (AngleWarningSecondLevelViewmodel level2AngleWarning in leve2AngleWarnings)
            {
                ItemSolver solveItem = TryGetSolutionForWarning(level1AngleWarning.Id, level2AngleWarning);

                // Found a solution, but does the new field/class exist in the current model?
                if (!EntityExistsInModel(solveItem))
                {
                    continue;
                }

                // Create the action part of the json request
                AngleWarningsTaskAction taskAction = AddActionArgument(level1AngleWarning.Id, level2AngleWarning, solveItem, modelId);

                // Request example: https://nl-dennis.eatestad.local:60010/models/1/angle_warnings/unsupported_display_field/items?include_public=true&include_private=true&include_validated=true&include_angles=true&include_templates=false&object=BillingDocumentItem&field=ERDAT
                List<AngleWarningThirdLevelViewmodel> level3AngleWarnings = GetLevel3Warnings(level2AngleWarning);
                
                // Create the target part of the json request
                level3AngleWarnings.ForEach(x => AddTargetIds(solveItem.Fix, taskAction, x));

                mainTaskModel.AddAction(taskAction);
            }
        }

        private bool EntityExistsInModel(ItemSolver solveItem)
        {
            if (solveItem == null || solveItem.Fix == WarningFix.NotSupportedMethod || solveItem.Fix == WarningFix.NoFixAvailable)
            {
                return false;
            }

            bool result = true;

            if (solveItem.Fix == WarningFix.ReplaceField && !_modelService.FieldExists(_model.FieldsUri.ToString() + $"?classes={solveItem.ObjectClass}&offset=0&limit=9999", solveItem.NewFieldOrClass, ref _cachedFields))
            {
                Log.SendWarning($"AWT:field up {solveItem.NewFieldOrClass} does not exist in class {solveItem.ObjectClass}.");

                result = false;
            }

            if (solveItem.Fix == WarningFix.ReplaceJump && !_modelService.FollowUpIdExists(_model.FollowupsUri.ToString() + $"?classes={solveItem.ObjectClass}&offset=0&limit=1000", solveItem.NewFieldOrClass, ref _cachedFollowUps))
            {
                Log.SendWarning($"AWT:follow up {solveItem.NewFieldOrClass} does not exists in class {solveItem.ObjectClass}.");

                result = false;
            }

            if (solveItem.Fix == WarningFix.ReplaceClass && !_modelService.ClassIdExists(_model.ClassesUri.ToString() + $"?offset=0&limit=1000", solveItem.NewFieldOrClass, ref _cachedClasses))
            {
                Log.SendWarning($"AWT:class {solveItem.NewFieldOrClass} does not exists.");
                result = false;
            }

            return result;
        }

        private ItemSolver TryGetSolutionForWarning(string warning, AngleWarningSecondLevelViewmodel level2AngleWarning)
        {
            return _contentInputter.GetSolveItem(warning, level2AngleWarning.Object, level2AngleWarning.Field, level2AngleWarning.Jump);
        }

        private AngleWarningsTaskAction AddActionArgument(string warning, AngleWarningSecondLevelViewmodel level2AngleWarning, ItemSolver solveItem, string modelId)
        {
            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelId);
            taskAction.AddActionArgument(level2AngleWarning.Field, solveItem, level2AngleWarning.Object, new string[] { warning });

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
            string limitOffsetQueryString = UtilitiesHelper.GetOffsetLimitQueryString(1, _sessionHelper.SystemSettings.max_pagesize);
            string requestUri = EveryAngle.Shared.Helpers.UrlHelper.GetRequestUrl(URLType.NOA) + level2AngleWarning.Uri + "&" + limitOffsetQueryString;
            var angleWarningsResult3 = this._modelService.GetAngleWarningThirdLevel(requestUri);
                        
            return JsonConvert.DeserializeObject<List<AngleWarningThirdLevelViewmodel>>(angleWarningsResult3.SelectToken("data").ToString());
        }

    }
}