using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using EveryAngle.OData.Settings;
using EveryAngle.OData.Utils;
using EveryAngle.OData.Utils.Logs;
using Microsoft.Data.Edm;
using Microsoft.Data.Edm.Library;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.BusinessLogic.Abstracts
{
    public abstract class AbstractEdmModelBusinessLogic
    {
        #region private variables

        private readonly ModelType _processingToModel;

        private readonly IAppServerProxy _appServerProxy;
        private readonly IAngleDataCollector _angleCollector;

        #endregion

        #region constructor

        public AbstractEdmModelBusinessLogic(
            IAppServerProxy appServerProxy,
            IAngleDataCollector angleDataCollector,
            ModelType processingToModel)
        {
            _appServerProxy = appServerProxy;
            _angleCollector = angleDataCollector;
            _processingToModel = processingToModel;
        }

        #endregion

        #region edm metadata

        public virtual EdmModel GetEdmModel()
        {
            return EdmModelContainer.Metadata[_processingToModel].EdmModel;
        }

        public virtual void SetModelAnnotationValue(IEdmElement element, string namespaceName, string localName, object value)
        {
            EdmModelContainer.Metadata[_processingToModel].EdmModel.SetAnnotationValue(element, namespaceName, localName, value);
        }

        public virtual void AddDisplayEntityModel(EdmEntityType displayEntityType)
        {
            EdmModelContainer.Metadata[_processingToModel].EdmModel.AddElement(displayEntityType);
        }

        public virtual void AddAngleDisplayEntitySet(string entitySetName, EdmEntityType displayEntityType)
        {
            EdmModelContainer.Metadata[_processingToModel].Container.AddEntitySet(entitySetName, displayEntityType);
        }

        #endregion

        #region field metadata

        public virtual bool TryGetField(FieldCompositeKey fieldKey, out Field outField)
        {
            return EdmModelContainer.Metadata[_processingToModel].Fields.TryGetValue(fieldKey, out outField);
        }

        public virtual bool TrySaveField(FieldCompositeKey fieldKey, Field newField)
        {
            return EdmModelContainer.Metadata[_processingToModel].Fields.TryAdd(fieldKey, newField);
        }

        public virtual int CountFields()
        {
            return EdmModelContainer.Metadata[_processingToModel].Fields.Count;
        }

        public virtual int CountAvailableFields()
        {
            return EdmModelContainer.Metadata[_processingToModel].Fields.Values.Count(field => field.is_available);
        }

        public virtual int CountUnavailableFields()
        {
            return EdmModelContainer.Metadata[_processingToModel].Fields.Values.Count(field => !field.is_available);
        }

        #endregion

        #region angle metadata

        public virtual ICollection<Angle> GetAngles()
        {
            // return proper ICollection here, we don't want to re-construct items as list
            return EdmModelContainer.Metadata[_processingToModel].Angles.Values;
        }

        public virtual IEnumerable<Angle> GetAvailableAngles()
        {
            // return proper IEnumerable here, we don't want to re-construct items as list
            return EdmModelContainer.Metadata[_processingToModel].Angles.Values.Where(angle => angle.is_available && angle.display_definitions.Any());
        }

        public virtual bool TryGetAngle(AngleCompositeKey angleKey, out Angle outAngle)
        {
            return EdmModelContainer.Metadata[_processingToModel].Angles.TryGetValue(angleKey, out outAngle);
        }

        public virtual bool TrySaveAngle(AngleCompositeKey angleKey, Angle newAngle)
        {
            return EdmModelContainer.Metadata[_processingToModel].Angles.TryAdd(angleKey, newAngle);
        }

        public virtual bool TryUpdateAngle(AngleCompositeKey angleKey, Angle newAngle, Angle oldAngle)
        {
            return EdmModelContainer.Metadata[_processingToModel].Angles.TryUpdate(angleKey, newAngle, oldAngle);
        }

        public virtual int CountAngles()
        {
            return EdmModelContainer.Metadata[_processingToModel].Angles.Count;
        }

        public virtual int CountAvailableAngles()
        {
            return EdmModelContainer.Metadata[_processingToModel].Angles.Values.Count(angle => angle.is_available);
        }

        public virtual int CountUnavailableAngles()
        {
            return EdmModelContainer.Metadata[_processingToModel].Angles.Values.Count(angle => !angle.is_available);
        }

        #endregion

        #region display metadata


        public virtual int CountDisplays()
        {
            return EdmModelContainer.Metadata[_processingToModel].Displays.Count();
        }
        public virtual int CountAvailableDisplays()
        {
            return EdmModelContainer.Metadata[_processingToModel].Displays.Count(display => display.is_available);
        }
        public virtual int CountUnavailableDisplays()
        {
            return EdmModelContainer.Metadata[_processingToModel].Displays.Count(display => !display.is_available);
        }

        #endregion

        #region routing descriptor

        public virtual bool GetAngleDisplayDescriptor(string entitySetName, out HttpControllerDescriptor desc)
        {
            return EdmModelContainer.Metadata[_processingToModel].RoutingDescriptors.TryGetValue(entitySetName.EntitySetId(), out desc);
        }

        public virtual void SetAngleDisplayDescriptor(string entitySetName, HttpControllerDescriptor descriptor)
        {
            EdmModelContainer.Metadata[_processingToModel].RoutingDescriptors.TryAdd(entitySetName.EntitySetId(), descriptor);
        }

        #endregion

        #region processing metadata

        public virtual bool IsAppServerAvailable(bool retryChecking)
        {
            return IsAppServerAvailable(_appServerProxy.SystemUser, retryChecking: true);
        }

        public virtual bool IsAppServerAvailable(User user, bool retryChecking)
        {
            if (retryChecking)
                LogService.Info(string.Format("Application Server: checking a connection to: {0}", ODataSettings.Settings.Host));

            int tryingCount = 0;
            while (tryingCount < 3)
            {
                // first try to get and assign the current instance to our storage.
                // after try to set a current instance, if it's still empty, retry
                if (TrySetMetadataCurrentInstance(user, out string currentInstance))
                {
                    // if current instance is returned, break the loop with return true.
                    if (retryChecking)
                        LogService.Info("Application Server: connection established.");

                    return true;
                }
                else
                {
                    // if no retrying required, break the loop.
                    if (!retryChecking)
                        break;

                    // if still have no current instance returned, retry.
                    ++tryingCount;
                    LogService.Warn(string.Format("Application Server: connection is not established, trying attempt {0} of 3", tryingCount));
                }
            }

            // incase of cannot AS is not reachable set the status to down 
            EdmModelContainer.Status = EdmModelStatus.Down;
            LogService.Error(string.Format("Application Server: failed to connect to: {0}", ODataSettings.Settings.Host));
            return false;
        }

        public virtual bool TrySetMetadataCurrentInstance(User user, out string currentInstance)
        {
            currentInstance = string.Empty;

            // always set latest instance, next time the metadata is sync, it is automatically always use the latest.
            if (_appServerProxy.TryGetCurrentInstance(user, out currentInstance))
                EdmModelContainer.Metadata[_processingToModel].CurrentInstance = currentInstance;

            return !string.IsNullOrEmpty(EdmModelContainer.Metadata[_processingToModel].CurrentInstance);
        }

        public virtual string GetCurrentInstance()
        {
            return EdmModelContainer.Metadata[_processingToModel].CurrentInstance;
        }

        public virtual bool SyncModelMetadata()
        {
            // this function is execute by background task.
            Stopwatch stopwatch = new Stopwatch();

            try
            {
                stopwatch.Start();

                LogService.Info("SyncModelMetadata: start collecting metadata.");
                EdmModelContainer.Status = EdmModelStatus.ImportingMetadata;
                ModelType syncTo = EdmModelContainer.Metadata[_processingToModel].ModelType;

                // try reaching the Application server(and set a current instance), if it's unreachable throw out and log as an error.
                if (!IsAppServerAvailable(retryChecking: true))
                    throw new WebException(string.Format("Instance of a model '{0}' is not established.", _appServerProxy.Model), WebExceptionStatus.ConnectFailure);

                // start collect an angle metadata by our collector
                _angleCollector.Collect(syncTo).Wait();

                // then update metadata container's last sync and assign status 'UP'
                UpdateLastSyncMetadataTimestamp();
                EdmModelContainer.Status = EdmModelStatus.Up;

                stopwatch.Stop();
                LogService.Info(string.Format("SyncModelMetadata: collecting metadata is finished, [time: {0}]", stopwatch.Elapsed.ToString()));

                return true;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                EdmModelContainer.Status = EdmModelStatus.Down;
                LogService.Error(string.Format("SyncModelMetadata: failed sync metadata, [time: {0}]", stopwatch.Elapsed.ToString()), ex);

                return false;
            }
        }

        public virtual void ReInitializeProcessingModel()
        {
            EdmModelContainer.Initialize();
        }

        public virtual void UpdateLastSyncMetadataTimestamp()
        {
            EdmModelContainer.LastSyncMetadataTimestamp = DateTime.UtcNow.ToUnixTimestamp();
            LogService.Info(string.Format("LastSyncMetadataTimestamp: Updated, last-sync-timestamp: {0} (GMT)", EdmModelContainer.LastSyncMetadataTimestamp));
        }

        public virtual void ClearUnusedMemory()
        {
            LogService.Info(string.Format("ClearUnusedMemory: Collecting unused memory for metadata, [Used: {0:N2}MB]", GetTotalMemory()));
            GC.Collect();
            LogService.Info(string.Format("ClearUnusedMemory: Finished collecting unused memory, [Using: {0:N2}MB]", GetTotalMemory()));
        }

        public virtual decimal GetTotalMemory()
        {
            return (Convert.ToDecimal(GC.GetTotalMemory(false)) / 1024.0m / 1024.0m);
        }

        #endregion
    }
}
