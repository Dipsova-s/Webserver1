using EveryAngle.OData.DTO;
using System.Collections.Concurrent;

namespace EveryAngle.OData.Repository
{
    public static class EdmModelContainer
    {
        #region constructors

        static EdmModelContainer()
        {
            Status = EdmModelStatus.Idle;
        }

        #endregion

        #region public variables

        public static ConcurrentDictionary<ModelType, IEdmModelMetadata> Metadata { get; set; }
        public static EdmModelStatus Status { get; set; }
        public static long LastSyncMetadataTimestamp { get; set; }

        #endregion

        #region public functions

        public static void Initialize()
        {
            Metadata = new ConcurrentDictionary<ModelType, IEdmModelMetadata>();
            Metadata.TryAdd(ModelType.Master, CreateEdmModelMetadata(ModelType.Master));
            Metadata.TryAdd(ModelType.Slave, CreateEdmModelMetadata(ModelType.Slave));
            Status = EdmModelStatus.Initialized;
        }
        public static void SwitchSlaveToMasterModel()
        {
            IEdmModelMetadata oldSlaveModel;
            IEdmModelMetadata oldMasterModel;
            // remove current slave and master model metadata
            if (Metadata.TryRemove(ModelType.Slave, out oldSlaveModel) &&
                Metadata.TryRemove(ModelType.Master, out oldMasterModel))
            {
                // switch the removing slave to master type then create a new slave
                oldSlaveModel.ModelType = ModelType.Master;
                if (Metadata.TryAdd(ModelType.Master, oldSlaveModel))
                    Metadata.TryAdd(ModelType.Slave, CreateEdmModelMetadata(ModelType.Slave));

                Status = EdmModelStatus.Up;
            }
        }
        public static IEdmModelMetadata CreateEdmModelMetadata(ModelType modelType)
        {
            return new EdmModelMetadata(modelType);
        }

        #endregion
    }
}