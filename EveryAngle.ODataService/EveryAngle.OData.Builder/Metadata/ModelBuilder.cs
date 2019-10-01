using EveryAngle.OData.Builder.ControllerSelectors;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
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

namespace EveryAngle.OData.Builder.Metadata
{
    // [In progress], sepration of concern from a EveryAngle.OData.Service > Builder to implement as its own layer
    public class ModelBuilder
    {
        #region private variables
        
        private readonly IRoutingControllerSelector _selector;
        private readonly IEdmModelBusinessLogic _edmModelBusinessLogic;
        private readonly IEdmStringTypeReference _edmStringType = EdmCoreModel.Instance.GetString(true);
        private readonly IAppServerProxy _appServerProxy;

        // type of dynamic routing on controller class, specifically on RowsController
        // in terms of re-usability, don't specified/hardcode it directly
        private readonly Type _routingControllerType;

        private const string EANamespaceName = "http://everyangle.org/schema";

        #endregion

        #region constructor

        public ModelBuilder(
            IEdmModelBusinessLogic edmModelBusinessLogic,
            IRoutingControllerSelector selector,
            Type routingControllerType)
        {
            _selector = selector;
            _edmModelBusinessLogic = edmModelBusinessLogic;
            _routingControllerType = routingControllerType;
            _appServerProxy = ObjectFactory.GetInstance<IAppServerProxy>();
        }

        public ModelBuilder(
            IEdmModelBusinessLogic edmModelBusinessLogic,
            IRoutingControllerSelector selector,
            Type routingControllerType,
            IAppServerProxy appServerProxy)
        {
            _selector = selector;
            _edmModelBusinessLogic = edmModelBusinessLogic;
            _routingControllerType = routingControllerType;
            _appServerProxy = appServerProxy;
        }

        #endregion

        #region public function

        public void BuildModel()
        {
            Stopwatch stopwatch = Stopwatch.StartNew();

            ICollection<Angle> angles = _edmModelBusinessLogic.GetAngles();
            foreach (Angle angle in angles)
            {
                // retrieve full angle details from the Application server
                Angle angleDetails = _appServerProxy.GetAngle(angle.uri, _appServerProxy.SystemUser);

                // possible case, angle was deleted while metadata is synced and running the builder, set as unavailable and skip it.
                if (!IsAngleUsable(angleDetails))
                {
                    angle.SetAsUnavailable();
                    continue;
                }

                // remember the full displays in the angle
                angle.SetDisplays(angleDetails.display_definitions);

                // if angle is containing an invalid field or definition, skip.
                if (IsAngleContainsInvalidData(angleDetails))
                {
                    angle.SetAsUnavailable();
                    continue;
                }

                // Now process each display of this angle
                foreach (Display display in angle.display_definitions)
                {
                    try
                    {
                        // checking invalid display, if any, skip
                        if (!IsDisplayUsable(angle, display)) {
                            continue;
                        }

                        // update display's field from model instance's field
                        if (display.contained_aggregation_steps)
                            UpdateCubeDisplayFields(display);
                        else
                            UpdateListDisplayFields(display);

                        // create an entity name for edm model.
                        string entitySetName = display.UniqueEntityName();
                        string entityTypeName = string.Format("{0}_{1}", display.angle_uri.IdFromUri(), display.uri.IdFromUri());
                        string angleDisplayName = string.Format("[{0}][{1}][{2}]", display.display_type, angle.name, display.name);

                        // create entity type from display name with unique type
                        EdmEntityType displayEntityType = GetDisplayEntityType(display, angleDisplayName, entityTypeName);

                        // store to metadata repositories.
                        _edmModelBusinessLogic.AddDisplayEntityModel(displayEntityType);
                        _edmModelBusinessLogic.AddAngleDisplayEntitySet(entitySetName, displayEntityType);
                        _edmModelBusinessLogic.SetAngleDisplayDescriptor(entitySetName, _selector.CreateDisplayDescriptor(entitySetName, display, _routingControllerType));
                    }
                    catch (Exception ex)
                    {
                        // make sure that the current display is unavailable caused of exception and cannot be used
                        display.SetAsUnavailable();

                        LogService.Warn(string.Format("Display skipped [display:{0}  message: {1}]", display.uri, ex.Message));
                    }
                }
            }

            // prepair counters
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

        #region internal functions

        internal void UpdateListDisplayFields(Display display)
        {
            List<Field> modelFields = GetCachedModelFields(display.fields.Select(field => field.id));

            // Set datatype based on modelfield
            foreach (Field field in display.fields)
            {
                Field modelField = modelFields.FirstOrDefault(mf => mf.id == field.id);
                if (modelField == null)
                    continue;

                field.uri = modelField.uri;
                field.fieldtype = modelField.fieldtype;
                field.short_name = modelField.short_name ?? modelField.id;
            }
        }

        internal void UpdateCubeDisplayFields(Display display)
        {
            // get first aggregation query step
            QueryStep aggregationStep = display.query_blocks
                                        .SelectMany(queryBlock => queryBlock.query_steps)
                                        .First(queryStep => queryStep.step_type == "aggregation");

            // Create 1 collection containing both the grouping and the aggregation fields
            List<AggregationField> query_fields =
                (aggregationStep.grouping_fields ?? new List<GroupingField>())
                .Concat(aggregationStep.aggregation_fields ?? new List<AggregationField>())
                .ToList();

            string[] query_fieldIds = query_fields.Where(field => field.field != "count").Select(field => field.source_field).Distinct().ToArray();
            List<Field> model_fields = GetCachedModelFields(query_fieldIds);

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

                    // this forced the field's type to double for pivot, actually it's decimal on model's field
                    if (query_field.@operator.ToLowerInvariant().Contains("average"))
                        field.fieldtype = "double";
                    else
                        field.fieldtype = modelField.fieldtype;

                    field.short_name = string.Format("{0} {1}", query_field.@operator, modelField.short_name);
                }

                field.uri = string.Format("/aggregation_fields/{0}", Math.Abs(field.id.GetHashCode()));
                field.UpdateUniqueXMLElementKey(field.AsXMLElementName());
                _edmModelBusinessLogic.TrySaveField(field.CompositeKey, field);
            }
        }

        internal List<Field> GetCachedModelFields(IEnumerable<string> fieldIds)
        {
            List<Field> result = new List<Field>();
            List<string> missingFields = new List<string>();

            // Get field information for specified fields in the same order as requested, collect missing fields.
            foreach (string fieldId in fieldIds)
            {
                if (_edmModelBusinessLogic.TryGetField(Extensions.GetFieldCompositeKey(businessId: fieldId), out Field modelField))
                    result.Add(modelField);
                else
                {
                    result.Add(new Field { id = fieldId });
                    missingFields.Add(fieldId);
                }
            }

            if (missingFields.Any())
            {
                // Get missing fields from the applpication server
                Fields newFields = _appServerProxy.GetModelFields(_edmModelBusinessLogic.GetCurrentInstance(), missingFields, _appServerProxy.SystemUser);

                // Check if all fields are returned
                IEnumerable<string> unknownFieldIds = missingFields.Except(newFields.fields.Select(field => field.id));

                // Register and Log unknown fields
                if (unknownFieldIds.Any())
                {
                    LogService.Info(string.Format("Unknown fields: {0}", string.Join(",", unknownFieldIds)));
                    foreach (string unknownFieldId in unknownFieldIds)
                    {
                        Field unknownField = new Field { id = unknownFieldId, uri = string.Format("/unknowns/{0}", unknownFieldId.GetHashCode()) };
                        unknownField.SetAsUnavailable();
                        unknownField.UpdateUniqueXMLElementKey(unknownField.AsXMLElementName());
                        _edmModelBusinessLogic.TrySaveField(unknownField.CompositeKey, unknownField);
                    }
                }

                // Register and update the new fields.
                foreach (Field newField in newFields.fields.Where(field => field.is_available))
                {
                    newField.UpdateUniqueXMLElementKey(newField.AsXMLElementName());
                    _edmModelBusinessLogic.TrySaveField(newField.CompositeKey, newField);
                    result[result.FindIndex(field => field.id == newField.id)] = newField;
                }
            }

            return result;
        }

        internal EdmEntityType GetDisplayEntityType(Display display, string angleDisplayName, string angleDisplayId)
        {
            EdmEntityType displayEntityType = new EdmEntityType("EA", angleDisplayId);
            _edmModelBusinessLogic.SetModelAnnotationValue(displayEntityType, EANamespaceName, "DisplayName", new EdmStringConstant(_edmStringType, angleDisplayName));

            // Process only 'valid' fields
            foreach (Field field in display.fields.Where(x => x.valid))
            {
                EdmPrimitiveTypeKind? kind = EdmPrimitiveConvert.GetKind(field);
                string structureKey = field.id == "ID" ? field.id : field.AsXMLElementName();
                EdmStructuralProperty prop = displayEntityType.AddStructuralProperty(structureKey, kind.Value);

                // Add custom attribute 'ShortName' to the EDM property
                _edmModelBusinessLogic.SetModelAnnotationValue(prop, EANamespaceName, "ShortName", new EdmStringConstant(_edmStringType, field.short_name));

                // Register ID field as Key field for this entityType
                if (field.id == "ID")
                    displayEntityType.AddKeys(prop);
            }

            return displayEntityType;
        }

        internal IEnumerable<QueryStep> GetDisplayQuerySteps(Display display)
        {
            return display.query_blocks.SelectMany(x => x.query_steps);
        }

        internal IList<QueryStep> GetAngleQuerySteps(Angle angle)
        {
            if (angle.query_definition == null)
                return new List<QueryStep>();

            return angle.query_definition
                .Where(x => x.query_steps != null)
                .SelectMany(x => x.query_steps)
                .ToList();
        }

        #region check invalid items

        internal bool IsAngleUsable(Angle angleDetails)
        {
            return angleDetails != null &&
                angleDetails.id != null &&
                angleDetails.is_published;
        }
        internal bool IsAngleContainsInvalidData(Angle angleDetails)
        {
            return ContainsInvalidAngleQueryDefinition(angleDetails) ||
                ContainsInvalidDefaultDisplay(angleDetails) ||
                ContainsOnlyPrivateDisplays(angleDetails);
        }
        internal bool IsDisplayUsable(Angle angle, Display display)
        {
            // checking invalid display, if any, skip
            if (!display.is_public || !IsValidDisplay(display))
            {
                display.SetAsUnavailable();
                if (angle.display_definitions.Count == 1)
                {
                    angle.SetAsUnavailable();
                    LogService.Warn(string.Format("WARN: [Angle:{0}  message: angle contains only 1 display with an invalid status]", angle.id));
                }
                return false;
            }
            return true;
        }
        internal bool IsValidDisplay(Display display)
        {
            return IsAggregationValid(display)
                && IsQueryStepsValid(display)
                && ContainsValidFields(display);
        }
        internal bool ContainsValidFields(Display display)
        {
            if (!display.fields.Any(field => field.valid))
            {
                LogService.Warn(string.Format("Display skipped: No valid fields [display:{0}]", display.uri));
                return false;
            }

            return true;
        }
        internal bool IsAggregationValid(Display display)
        {
            // only proceed when this is an aggregation based display
            if (!display.contained_aggregation_steps)
                return true;

            // Get the aggregation step
            QueryStep aggregationStep = GetDisplayQuerySteps(display).First(step => step.step_type.Equals("aggregation"));

            // Get invalid source fields
            IEnumerable<string> invalidAggregationFields = aggregationStep.aggregation_fields
                .Where(field => field.valid.Equals(false))
                .Select(field => "aggregation: " + field.source_field);

            IEnumerable<string> invalidGroupingFields = aggregationStep.grouping_fields
                .Where(field => field.valid.Equals(false))
                .Select(field => "grouping: " + field.source_field);

            if (invalidAggregationFields.Any() || invalidGroupingFields.Any())
            {
                LogService.Warn(string.Format("Display skipped: Aggregation invalid [Display:{0}]\r\n  Invalid fields: {1}",
                    display.uri, string.Join(", ", invalidAggregationFields.Union(invalidGroupingFields))));
                return false;
            }

            return true;
        }
        internal bool IsQueryStepsValid(Display display)
        {
            // check for query step
            IEnumerable<QueryStep> invalidQuerySteps = GetDisplayQuerySteps(display)
                .Where(step => step.valid.Equals(false));

            if (invalidQuerySteps.Any())
            {
                LogService.Warn(string.Format("Display skipped: Query steps invalid [display:{0}]\r\n  Invalid steps: {1}",
                    display.uri, string.Join(", ", invalidQuerySteps.Select(step => step.step_type + ":" + step.field))));

                return false;
            }

            return true;
        }
        internal bool ContainsInvalidAngleQueryDefinition(Angle angle)
        {
            // check for definition's query step
            IList<QueryStep> querySteps = GetAngleQuerySteps(angle);

            if (querySteps.Any(queryStep => queryStep.valid.Equals(false)))
            {
                LogService.Warn(string.Format("WARN: [Angle:{0}  message: angle contains invalid querySteps]", angle.id));
                return true;
            }

            // then checking for overall definition
            if (angle.query_definition.Any(definition => definition.valid.Equals(false)))
            {
                LogService.Warn(string.Format("WARN: [Angle:{0}  message: angle contains invalid query_definition]", angle.id));
                return true;
            }

            return false;
        }
        internal bool ContainsInvalidDefaultDisplay(Angle angle)
        {
            Display defaultDisplay = angle.display_definitions.First(display => display.is_angle_default);
            bool containsValidDisplayField = defaultDisplay.fields.Any(field => field.valid);
            if (!containsValidDisplayField)
            {
                LogService.Warn(string.Format("WARN: [display:{0}  message: default display contains no valid fields]", defaultDisplay.uri));
            }

            return !containsValidDisplayField;
        }
        internal bool ContainsOnlyPrivateDisplays(Angle angle)
        {
            if (angle.displays_summary == null)
                return false;

            bool containsPublicDisplays = angle.displays_summary.Any(display => display.is_public);
            if (!containsPublicDisplays)
            {
                LogService.Warn(string.Format("WARN: [angle:{0}  message: contains no public display(s)]", angle.name));
            }

            return !containsPublicDisplays;
        }

        #endregion

        #endregion
    }
}
