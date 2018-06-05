using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.Proxy;
using Microsoft.Data.Edm;
using Microsoft.Data.Edm.Library;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.BusinessLogic.Interfaces
{
    public interface IEdmModelBusinessLogic
    {
        #region edm metadata

        EdmModel GetEdmModel();

        void SetModelAnnotationValue(IEdmElement element, string namespaceName, string localName, object value);

        void AddDisplayEntityModel(EdmEntityType displayEntityType);

        void AddAngleDisplayEntitySet(string entitySetName, EdmEntityType displayEntityType);

        #endregion

        #region field metadata

        bool TryGetField(FieldCompositeKey fieldKey, out Field outField);

        bool TrySaveField(FieldCompositeKey fieldKey, Field newField);

        int CountFields();

        int CountAvailableFields();

        int CountUnavailableFields();

        #endregion

        #region angle metadata

        ICollection<Angle> GetAngles();

        IEnumerable<Angle> GetAvailableAngles();

        bool TryGetAngle(AngleCompositeKey angleKey, out Angle outAngle);

        bool TrySaveAngle(AngleCompositeKey angleKey, Angle newAngle);

        bool TryUpdateAngle(AngleCompositeKey angleKey, Angle newAngle, Angle oldAngle);

        int CountAngles();

        int CountAvailableAngles();

        int CountUnavailableAngles();

        #endregion

        #region display metadata

        int CountDisplays();

        int CountAvailableDisplays();

        int CountUnavailableDisplays();

        #endregion

        #region routing descriptor

        bool GetAngleDisplayDescriptor(string entitySetName, out HttpControllerDescriptor desc);

        void SetAngleDisplayDescriptor(string entitySetName, HttpControllerDescriptor descriptor);

        #endregion

        #region processing metadata

        bool IsAppServerAvailable(bool retryChecking);

        bool IsAppServerAvailable(User user, bool retryChecking);

        bool TrySetMetadataCurrentInstance(User user, out string currentInstance);

        string GetCurrentInstance();

        bool SyncModelMetadata();

        void ReInitializeProcessingModel();

        void UpdateLastSyncMetadataTimestamp();

        void ClearUnusedMemory();

        decimal GetTotalMemory();

        #endregion
    }
}
