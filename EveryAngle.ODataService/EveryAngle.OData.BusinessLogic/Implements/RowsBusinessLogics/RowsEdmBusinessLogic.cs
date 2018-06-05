using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using EveryAngle.OData.Utils;
using EveryAngle.OData.Utils.Logs;
using Microsoft.Data.Edm;
using Microsoft.Data.Edm.Library;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Query;

namespace EveryAngle.OData.BusinessLogic.Rows
{
    public class RowsEdmBusinessLogic : IRowsEdmBusinessLogic
    {
        #region private variables

        private IEdmModelMetadata _masterMetadata;

        private readonly IAppServerProxy _appServerProxy;
        private readonly DateTime _baseDate = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Unspecified);

        #endregion

        #region constructors

        public RowsEdmBusinessLogic(
            IAppServerProxy appServerProxy)
        {
            _appServerProxy = appServerProxy;
        }

        #endregion

        #region public functions

        public virtual EdmEntityObjectCollection GetRowsEntityCollection(IContext context, HttpRequestMessage request, NameValueCollection nameValueCollection, Display display)
        {
            // always get latest security token
            _masterMetadata = EdmModelContainer.Metadata[ModelType.Master];

            IEdmCollectionType collectionType = GetEdmCollectionType(request.ODataProperties());
            IEdmEntityType entityType = (IEdmEntityType)collectionType.ElementType.Definition;

            ODataQueryContext queryContext = new ODataQueryContext(_masterMetadata.EdmModel, entityType);
            ODataQueryOptions queryOptions = new ODataQueryOptions(queryContext, request);

            // retrieve the result ID from the query parameters. 
            // this is present when a 'next page' is requested after an initial angle execute
            NameValueCollection nameValues = nameValueCollection;
            string resultId = nameValues.Get("result");

            // retrieve the requested angle data
            int? nextLinkSkip;
            int totalCount;
            IList<IEdmEntityObject> data = ReadData(context, entityType, display, queryOptions, ref resultId, out totalCount, out nextLinkSkip);
            IEdmCollectionTypeReference edmTypeReference = GetEdmCollectionTypeReference(collectionType, true);

            // Set 'NextLink' when more data is available
            string next;
            CreateNextPageLink(request, nameValues, resultId, nextLinkSkip, out next);

            // Report total nr of rows available
            request.ODataProperties().TotalCount = totalCount;
            EdmEntityObjectCollection result = GetEdmEntityObjectCollection(edmTypeReference, data);
            return result;
        }

        public virtual IEdmCollectionType GetEdmCollectionType(HttpRequestMessageProperties properties)
        {
            return properties.Path.EdmType as IEdmCollectionType;
        }

        public virtual IEdmCollectionTypeReference GetEdmCollectionTypeReference(IEdmCollectionType collectionType, bool isNullable)
        {
            return new EdmCollectionTypeReference(collectionType, isNullable);
        }

        public virtual EdmEntityObjectCollection GetEdmEntityObjectCollection(IEdmCollectionTypeReference edmType, IList<IEdmEntityObject> list)
        {
            return new EdmEntityObjectCollection(edmType, list);
        }

        public virtual void CreateNextPageLink(HttpRequestMessage request, NameValueCollection nameValues, string resultId, int? nextLinkSkip, out string next)
        {
            next = null;
            if (nextLinkSkip != null)
            {
                nameValues.Set("$skip", nextLinkSkip.ToString());
                nameValues.Set("result", resultId);
                Uri nextLink = new Uri(request.RequestUri, request.RequestUri.AbsolutePath
                    + "?" + string.Join("&", nameValues.AllKeys.Select(key => key + "=" + nameValues.Get(key))));
                request.ODataProperties().NextLink = nextLink;
                next = nextLink.ToString();
            }
        }

        public virtual IList<IEdmEntityObject> ReadData(IContext context, IEdmEntityType type, Display display, ODataQueryOptions queryOptions, ref string resultId, out int totalCount, out int? nextLinkSkip)
        {
            nextLinkSkip = null;
            totalCount = 0;

            QueryResult result;
            List<IEdmEntityObject> list = new List<IEdmEntityObject>();

            // prepare paging
            int skip = queryOptions.Skip == null ? 0 : queryOptions.Skip.Value;
            int? top = queryOptions.Top == null ? (int?)null : queryOptions.Top.Value;

            // determine if we have no resultId (first execute), or Get the result
            result = DetermineGetResult(context, display, queryOptions, resultId);

            // Return an empty list when execution failed.
            if (result == null || !result.successfully_completed)
                return list;

            // set current result's Id, extract from result's uri if we have no resultId (first execute)
            resultId = resultId ?? result.uri.Split('/').Last();

            // Retrieve the datarows
            DataRows data = _appServerProxy.GetResultData(context.User, result, display, skip, top);

            // Return an empty list when no datarows
            if (data == null || data.rows == null)
                return list;

            // Initialize the fieldmap
            IList<FieldMap> fieldMaps = GetFieldMap(type, data);

            // Copy each row / cell to a Edm property value
            InitializeEdmEntityCollection(type, list, data, fieldMaps);

            // register total number of rows in the result
            totalCount = data.header.total.Value;

            // calculate the start of a next page.
            if (top == null && skip + data.rows.Count < totalCount)
                nextLinkSkip = skip + data.rows.Count;

            return list;
        }

        private QueryResult DetermineGetResult(IContext context, Display display, ODataQueryOptions queryOptions, string resultId)
        {
            // if result's id is not available yet, POST a new result.
            if (string.IsNullOrEmpty(resultId))
                return _appServerProxy.ExecuteAngleDisplay(context.User, display);

            // if Skip is null(pre-request), get a prepared result.
            if (queryOptions.Skip == null)
                return _appServerProxy.GetResult(context.User, "/results/" + resultId);

            // if result's datarows is available, return successfully_completed with a datarows uri.
            return new QueryResult
            {
                successfully_completed = true,
                uri = string.Format("/results/{0}", resultId),
                data_rows = string.Format("/results/{0}/datarows", resultId)
            };
        }

        public virtual IList<IEdmEntityObject> InitializeEdmEntityCollection(IEdmEntityType type, IList<IEdmEntityObject> list, DataRows data, IList<FieldMap> fieldMaps)
        {
            if (!fieldMaps.Any())
                return list;

            foreach (Row row in data.rows)
            {
                EdmEntityObject objRow = new EdmEntityObject(type);

                int i = 0;
                foreach (IEdmStructuralProperty prop in GetEdmStructuralProperty(type))
                {
                    FieldMap _fieldMap = fieldMaps[i++];

                    object value = _fieldMap.Index > -1
                        ? ConvertValue(row.field_values[_fieldMap.Index], _fieldMap)
                        : null;

                    objRow.TrySetPropertyValue(prop.Name, value);
                }

                list.Add(objRow);
            }

            return list;
        }

        public virtual IEnumerable<IEdmStructuralProperty> GetEdmStructuralProperty(IEdmEntityType type)
        {
            return type.DeclaredStructuralProperties();
        }

        public virtual IList<FieldMap> GetFieldMap(IEdmEntityType type, DataRows data)
        {
            IList<FieldMap> results = new List<FieldMap>();
            foreach (IEdmStructuralProperty prop in GetEdmStructuralProperty(type))
            {
                Field field;
                if (!_masterMetadata.Fields.TryGetValue(Extensions.GetFieldCompositeKey(businessId: prop.Name), out field))
                    LogService.Warn(string.Format("Returning data row: field {0} is not found on the metadata.", prop.Name));

                FieldMap fieldMap = new FieldMap
                {
                    Index = data.fields.IndexOf(field == null ? prop.Name : field.id),
                    IsDate = prop.Type.IsDateTime(),
                    IsDouble = prop.Type.IsDouble(),
                    IsDecimal = prop.Type.IsDecimal(),
                    IsTime = prop.Type.IsTime(),
                    IsEnumerated = field != null && field.fieldtype == "enumerated",
                    IsPeriod = field != null && field.fieldtype == "period",
                };

                fieldMap.NeedsConversion =
                    fieldMap.IsDate || fieldMap.IsDouble ||
                    fieldMap.IsPeriod || fieldMap.IsDecimal ||
                    fieldMap.IsTime || fieldMap.IsEnumerated;

                results.Add(fieldMap);
            }

            return results;
        }

        public virtual object ConvertValue(object value, FieldMap fieldMap)
        {
            object result = null;

            try
            {
                // AS could return both signed(long) and unsigned(double) value, 
                // try to use long if it can't, use double.
                long longValue;
                double doubleValue;

                // in case of currency, the returns value is a dictionary object, 'a' = number and 'b' = currency
                // convert explicitly instead of type's convertibility.
                if (fieldMap.IsDecimal && value is Dictionary<string, object>)
                    return Extensions.ConvertCurrencyDataObject(value, fieldMap.IsDecimal);

                // TODO: enumerated type will be implement later
                if (value == null || !fieldMap.NeedsConversion || fieldMap.IsEnumerated)
                    result = value;
                else if (fieldMap.IsDate)
                {
                    if (Int64.TryParse(value.ToString(), out longValue))
                        result = _baseDate.AddSeconds(longValue);
                    else if (Double.TryParse(value.ToString(), out doubleValue))
                        result = _baseDate.AddSeconds(doubleValue);
                }
                else if (fieldMap.IsDouble)
                {
                    if (value is Dictionary<string, object>)
                        result = Extensions.ConvertCurrencyDataObject(value, fieldMap.IsDecimal);
                    else
                        result = Convert.ToDouble(value);
                }
                else if (fieldMap.IsPeriod)
                    result = (long)value;
                else if (fieldMap.IsDecimal)
                    result = Convert.ToDecimal(value);
                else if (fieldMap.IsTime)
                {
                    if (Int64.TryParse(value.ToString(), out longValue))
                        result = TimeSpan.FromSeconds(longValue);
                    else if (Double.TryParse(value.ToString(), out doubleValue))
                        result = TimeSpan.FromSeconds(doubleValue);
                }
            }
            catch (Exception ex)
            {
                LogService.Error(string.Format("Cannot convert value {0}", value.ToString()), ex);
                throw ex;
            }

            return result;
        }

        #endregion
    }
}
