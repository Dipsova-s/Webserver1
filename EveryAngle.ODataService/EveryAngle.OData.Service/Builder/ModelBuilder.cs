using EveryAngle.OData.BusinessLogic.Abstracts;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.IoC;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Service.ControllerSelectors;
using EveryAngle.OData.Utils;
using EveryAngle.OData.Utils.Logs;
using EveryAngle.Utilities.IoC;
using Microsoft.Data.Edm;
using Microsoft.Data.Edm.Library;
using Microsoft.Data.Edm.Library.Values;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;

namespace EveryAngle.OData.Service
{
    public class ModelBuilder
    {
        #region private variables

        private string _token;

        private readonly ICollection<Angle> _angles;
        private readonly IRoutingControllerSelector _selector;
        private readonly IEdmModelBusinessLogic _edmModelBusinessLogic;
        private readonly IEdmStringTypeReference _edmStringType = EdmCoreModel.Instance.GetString(true);
        private readonly IAppServerProxy _appServerProxy = ObjectFactory.GetInstance<IAppServerProxy>();

        private const string EANamespaceName = "http://everyangle.org/schema";

        #endregion

        #region constructor

        public ModelBuilder(
            IEdmModelBusinessLogic edmModelBusinessLogic,
            IRoutingControllerSelector selector)
        {
            _selector = selector;
            _edmModelBusinessLogic = edmModelBusinessLogic;
            _angles = _edmModelBusinessLogic.GetAngles();
        }

        #endregion

        #region public function

        public void BuildModel()
        {
            Stopwatch stopwatch = Stopwatch.StartNew();

            _token = _appServerProxy.LoginBackgroundUser();

            // get total angles comparing to storing metadata.
            Angles angles = _appServerProxy.GetModelAngles(ODataSettings.Settings.Model, 0, string.Empty, _token);

            LogService.Info(string.Format("Retrieved {0}/{1} angles", _angles.Count, angles.header.total));

            foreach (Angle angle in _angles)
            {
                // if angle is containing an invalid field or definition, skip.
                if (ContainsInvalidAngleQueryDefinition(angle, _token) ||
                    ContainsInvalidDefaultDisplay(angle) ||
                    ContainsOnlyPrivateDisplays(angle))
                    continue;

                Display currentDisplay = null;
                foreach (DisplaysSummary display_summary in angle.displays_summary)
                {
                    try
                    {
                        currentDisplay = _edmModelBusinessLogic.GetAngleDisplay(display_summary.CompositeKey);

                        // if display is not public, skip.
                        if (!currentDisplay.is_public)
                            continue;

                        // checking invalid display, if any, skip
                        if (ContainsInvalidAggregationField(currentDisplay) ||
                            ContainsInvalidAggregationStep(currentDisplay) ||
                            ContainsInvalidGroupingField(currentDisplay) ||
                            ContainsInvalidQueryStep(currentDisplay) ||
                            ContainsNoValidField(currentDisplay))
                            continue;

                        // update display's field from model instance's field
                        if (currentDisplay.contained_aggregation_steps)
                            currentDisplay = UpdateCubeDisplayFields(currentDisplay, _token);
                        else
                            currentDisplay = UpdateListDisplayFields(currentDisplay, _token);

                        // create an entity name for edm model.
                        string entitySetName = currentDisplay.UniqueEntityName();
                        string entityTypeName = string.Format("{0}_{1}", currentDisplay.angle_uri.IdFromUri(), currentDisplay.uri.IdFromUri());
                        string angleDisplayName = string.Format("[{0}][{1}][{2}]", currentDisplay.display_type, angle.name, currentDisplay.name);

                        // create entity type from display name with unique type
                        EdmEntityType displayEntityType = GetDisplayEntityType(currentDisplay, angleDisplayName, entityTypeName);

                        // store to metadata repositories.
                        _edmModelBusinessLogic.TryUpdateDisplay(display_summary.CompositeKey, currentDisplay, currentDisplay);
                        _edmModelBusinessLogic.AddDisplayEntityModel(displayEntityType);
                        _edmModelBusinessLogic.AddAngleDisplayEntitySet(entitySetName, displayEntityType);
                        _edmModelBusinessLogic.SetAngleDisplayDescriptor(entitySetName, _selector.CreateDisplayDescriptor(entitySetName, currentDisplay));
                    }
                    catch (Exception ex)
                    {
                        // make sure that the current display is unavailable caused of exception and cannot be used
                        if (currentDisplay != null)
                            currentDisplay.SetAsUnavailable();

                        LogService.Error(string.Format("WARN: display skipped [display:{0}  message: {1}]", display_summary.uri, ex.Message));
                    }
                }
            }

            // update un/available item container
            _edmModelBusinessLogic.UpdateUnavailableAngles();
            _edmModelBusinessLogic.UpdateUnavailableDisplays();

            stopwatch.Stop();
            LogService.Info(string.Format(
                @"Finished Reading angles [time: {0}, angles: {1} (valid: {2}, skipped: {3}), displays: {4} (valid: {5}, skipped: {6})]", 
                stopwatch.Elapsed,
                _edmModelBusinessLogic.CountAngles(),
                _edmModelBusinessLogic.CountAvailableAngles(),
                _edmModelBusinessLogic.CountUnavailableAngles(),
                _edmModelBusinessLogic.CountDisplays(),
                _edmModelBusinessLogic.CountAvailableDisplays(),
                _edmModelBusinessLogic.CountUnavailableDisplays()
                ));
        }

        #endregion

        #region private functions

        private Display UpdateListDisplayFields(Display display, string token)
        {
            List<Field> modelFields = GetCachedModelFields(display.fields.Select(field => field.id), token);

            // Set datatype based on modelfield
            foreach (Field field in display.fields)
            {
                Field modelField = modelFields.FirstOrDefault(mf => mf.id == field.id);
                if (modelField == null)
                    continue;

                field.fieldtype = modelField.fieldtype;
                field.short_name = modelField.short_name ?? modelField.id;
            }

            return display;
        }

        private Display UpdateCubeDisplayFields(Display display, string token)
        {
            // get first aggregation query step
            QueryStep aggregationStep = display.query_blocks.SelectMany(queryBlock => queryBlock.query_steps).First(queryStep => queryStep.step_type == "aggregation");

            // Create 1 collection containing both the grouping and the aggregation fields
            List<AggregationField> query_fields =
                (aggregationStep.grouping_fields ?? new List<GroupingField>())
                .Concat(aggregationStep.aggregation_fields ?? new List<AggregationField>())
                .ToList();

            int model = int.Parse(display.uri.Split('/')[2]);
            string[] query_fieldIds = query_fields.Where(field => field.field != "count").Select(field => field.source_field).Distinct().ToArray();
            var model_fields = GetCachedModelFields(query_fieldIds, token);

            foreach (Field field in display.fields)
            {
                if (field.id.ToLowerInvariant().StartsWith("count"))
                {
                    field.fieldtype = "int";
                    field.short_name = field.id;
                }
                else
                {
                    AggregationField query_field = query_fields.First(qf => qf.field == field.id);
                    Field modelField = model_fields.FirstOrDefault(model_field => model_field.id == query_field.source_field);
                    if (modelField == null)
                        continue;

                    if (query_field.@operator.ToLowerInvariant().Contains("average"))
                        field.fieldtype = "double";
                    else
                        field.fieldtype = modelField.fieldtype;

                    field.short_name = string.Format("{0} {1}", query_field.@operator, modelField.short_name);
                }
            }

            return display;
        }

        private List<Field> GetCachedModelFields(IEnumerable<string> fieldIds, string token)
        {
            List<Field> result = new List<Field>();
            List<string> missingFields = new List<string>();

            // Get field information for specified fields in the same order as requested.
            foreach (string fieldId in fieldIds)
            {
                Field modelField;
                if (_edmModelBusinessLogic.TryGetField(Extensions.GetFieldCompositeKey(businessId: fieldId), out modelField))
                    result.Add(modelField);
                else
                {
                    result.Add(new Field() { id = fieldId });
                    missingFields.Add(fieldId);
                }
            }

            if (missingFields.Any())
            {
                Fields newFields = _appServerProxy.GetModelFields(_edmModelBusinessLogic.GetCurrentInstance(), missingFields, token);

                // Make sure all requested fields are returned
                if (newFields.fields.Count != missingFields.Count())
                {
                    LogService.Info(String.Format("Unknown fields: {0}", string.Join(",", missingFields.Except(newFields.fields.Select(field => field.id)))));
                }
                else
                {
                    foreach (Field newField in newFields.fields)
                    {
                        _edmModelBusinessLogic.TrySaveField(newField.CompositeKey, newField);
                        result[result.FindIndex(field => field.id == newField.id)] = newField;
                    }
                }
            }

            return result;
        }

        private EdmEntityType GetDisplayEntityType(Display display, string angleDisplayName, string angleDisplayId)
        {
            EdmEntityType displayEntityType = new EdmEntityType("EA", angleDisplayId);
            _edmModelBusinessLogic.SetModelAnnotationValue(displayEntityType, EANamespaceName, "DisplayName", new EdmStringConstant(_edmStringType, angleDisplayName));

            // Process only 'valid' fields
            foreach (Field field in display.fields.Where(x => x.valid))
            {
                EdmPrimitiveTypeKind? kind = EdmPrimitiveConvert.GetKind(field);
                string structureKey = field.id.Replace(":", "_");
                EdmStructuralProperty prop = displayEntityType.AddStructuralProperty(structureKey, kind.Value);

                // Add custom attribute 'ShortName' to the EDM property
                _edmModelBusinessLogic.SetModelAnnotationValue(prop, EANamespaceName, "ShortName", new EdmStringConstant(_edmStringType, field.short_name));

                // Register ID field as Key field for this entityType
                if (field.id == "ID")
                    displayEntityType.AddKeys(prop);
            }

            return displayEntityType;
        }

        private bool TryGetDisplayQueryStep(Display display, out IList<QueryStep> returnQuerySteps)
        {
            IEnumerable<QueryStep> querySteps = display.query_blocks.SelectMany(x => x.query_steps);
            if (display.query_blocks.Any())
            {
                returnQuerySteps = querySteps.ToList();
                return true;
            }

            returnQuerySteps = new List<QueryStep>();
            return false;
        }

        private bool TryGetAngleQueryStep(Angle angle, out IList<QueryStep> returnQuerySteps)
        {
            returnQuerySteps = new List<QueryStep>();
            if (angle.query_definition == null || !angle.query_definition.Any())
                return false;

            IEnumerable<QueryDefinition> queryDefinitions = angle.query_definition.Where(x => x.query_steps != null);
            IEnumerable<QueryStep> querySteps = queryDefinitions.SelectMany(x => x.query_steps);
            if (querySteps != null && querySteps.Any())
            {
                returnQuerySteps = querySteps.ToList();
                return true;
            }

            return false;
        }

        #region check invalid items

        private bool ContainsNoValidField(Display display)
        {
            bool containsNoAnyValidField = !display.fields.Any(field => field.valid);
            if (containsNoAnyValidField)
            {
                display.SetAsUnavailable();
                LogService.Info(string.Format("WARN: [display:{0}(uri: {1})  message: List display contains no valid fields]", display.id, display.uri));
            }

            return containsNoAnyValidField;
        }
        private bool ContainsInvalidAggregationField(Display display)
        {
            // check for aggregation fields
            IList<QueryStep> querySteps;
            bool containsInvalidAggregationField = false;
            if (TryGetDisplayQueryStep(display, out querySteps))
            {
                querySteps = querySteps.Where(x => x.aggregation_fields != null).ToList();
                IList<AggregationField> aggregationFields = querySteps.SelectMany(x => x.aggregation_fields).ToList();
                if (aggregationFields.Any())
                {
                    containsInvalidAggregationField = aggregationFields.Any(x => x.valid.HasValue && !x.valid.Value);
                    if (containsInvalidAggregationField)
                    {
                        display.SetAsUnavailable();
                        LogService.Info(string.Format("WARN: [display:{0}(uri: {1})  message: Display contains invalid Aggregation fields]", display.id, display.uri));
                    }
                }
            }

            return containsInvalidAggregationField;
        }
        private bool ContainsInvalidAggregationStep(Display display)
        {
            // check for aggregation steps
            bool containsInvalidAggregationField = display.contained_aggregation_steps && !display.fields.All(field => field.valid);
            if (containsInvalidAggregationField)
            {
                display.SetAsUnavailable();
                LogService.Info(string.Format("WARN: [display:{0}(uri: {1})  message: Aggregation display contains invalid fields]", display.id, display.uri));
            }

            return containsInvalidAggregationField;
        }
        private bool ContainsInvalidQueryStep(Display display)
        {
            // check for query step
            IList<QueryStep> querySteps;
            if (!TryGetDisplayQueryStep(display, out querySteps))
                return false;

            bool containsInvalidQueryStep = querySteps.Any(step => step.valid.HasValue && !step.valid.Value);
            if (containsInvalidQueryStep)
            {
                display.SetAsUnavailable();
                LogService.Info(string.Format("WARN: [display:{0}(uri: {1})  message: Display contains invalid query step]", display.id, display.uri));
            }

            return containsInvalidQueryStep;
        }
        private bool ContainsInvalidGroupingField(Display display)
        {
            // check for grouping field
            IList<QueryStep> querySteps;
            if (!TryGetDisplayQueryStep(display, out querySteps))
                return false;

            IEnumerable<GroupingField> groupingFields = querySteps.Where(step => step.grouping_fields != null).SelectMany(x => x.grouping_fields);
            bool containsInvalidGroupingField = groupingFields.Any(groupingField => groupingField.valid.HasValue && !groupingField.valid.Value);
            if (containsInvalidGroupingField)
            {
                display.SetAsUnavailable();
                LogService.Info(string.Format("WARN: [display:{0}(uri: {1})  message: Display contains invalid grouping fields]", display.id, display.uri));
            }

            return containsInvalidGroupingField;
        }
        private bool ContainsInvalidAngleQueryDefinition(Angle angle, string token)
        {
            bool containsInvalidDefinition = false;
            Angle fullDetailsAngle = _appServerProxy.GetAngle(angle.uri, token);

            // check for definition's query step
            IList<QueryStep> querySteps;
            if (TryGetAngleQueryStep(fullDetailsAngle, out querySteps))
            {
                containsInvalidDefinition = querySteps.Any(x => x.valid.HasValue && !x.valid.Value);
                if (containsInvalidDefinition)
                {
                    angle.SetAsUnavailable();
                    LogService.Info(string.Format("WARN: [Angle:{0}  message: angle contains invalid query_definition]", angle.id));
                    return containsInvalidDefinition;
                }
            }

            // then checking for overall definition
            IList<QueryDefinition> queryDefinitions = fullDetailsAngle.query_definition;
            containsInvalidDefinition = queryDefinitions.Any(definition => definition.valid.HasValue && !definition.valid.Value);
            if (containsInvalidDefinition)
            {
                angle.SetAsUnavailable();
                LogService.Info(string.Format("WARN: [Angle:{0}  message: angle contains invalid query_definition]", angle.id));
            }

            return containsInvalidDefinition;
        }
        private bool ContainsInvalidDefaultDisplay(Angle angle)
        {
            Display defaultDisplay = _edmModelBusinessLogic.GetAngleDisplay(angle.displays_summary.Single(display => display.is_angle_default).CompositeKey);
            bool containsNoValidDisplayField = defaultDisplay.fields.All(field => !field.valid);
            if (containsNoValidDisplayField)
            {
                angle.SetAsUnavailable();
                LogService.Info(string.Format("WARN: [display:{0}  message: default display contains no valid fields]", defaultDisplay.uri));
            }


            return containsNoValidDisplayField;
        }
        private bool ContainsOnlyPrivateDisplays(Angle angle)
        {
            if (angle.displays_summary == null || !angle.displays_summary.Any())
                return false;

            bool containsOnlyPrivateDisplays = angle.displays_summary.All(x => x.is_public == false);
            if (containsOnlyPrivateDisplays)
            {
                angle.SetAsUnavailable();
                LogService.Info(string.Format("WARN: [angle:{0}  message: contains only private display(s)]", angle.name));
            }

            return containsOnlyPrivateDisplays;
        }


        #endregion

        #endregion
    }
}