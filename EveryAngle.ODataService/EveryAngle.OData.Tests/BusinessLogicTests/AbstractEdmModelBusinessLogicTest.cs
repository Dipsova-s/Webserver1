using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.Collector.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using EveryAngle.OData.Utils;
using Microsoft.Data.Edm;
using Microsoft.Data.Edm.Expressions;
using Microsoft.Data.Edm.Library;
using Microsoft.Data.Edm.Library.Values;
using Microsoft.Data.Edm.Values;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http.Controllers;

namespace EveryAngle.OData.Tests.BusinessLogicTests
{
    [TestFixture(Category = "ModelMetaData")]
    public class AbstractEdmModelBusinessLogicTest : UnitTestBase
    {
        #region private variables

        private readonly Mock<IContext> _context = new Mock<IContext>();
        private readonly Mock<IAppServerProxy> _appServerProxy = new Mock<IAppServerProxy>();
        private readonly Mock<IAngleDataCollector> _mockAngleDataCollector = new Mock<IAngleDataCollector>();

        private Angle _testingAngle = new Angle();
        private AngleCompositeKey _testingCompositeKey;
        private MasterEdmModelBusinessLogic _testingBusinessLogic;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            Initialize();

            string mockInstance = "/models/9999/instances/8888";
            _appServerProxy.Setup(x => x.TryGetCurrentInstance(It.IsAny<User>(), out mockInstance)).Returns(true);

            _mockAngleDataCollector.Setup(o => o.Collect(It.IsAny<ModelType>())).Returns(Task.FromResult(true));

            _testingBusinessLogic = new MasterEdmModelBusinessLogic(
                _appServerProxy.Object, _mockAngleDataCollector.Object);

            _testingAngle = new Angle();
            _testingAngle.name = "validation_me";
            _testingAngle.id = "testing_angle_id";
            _testingAngle.uri = "models/1/angles/1233";

            _testingCompositeKey = _testingAngle.CompositeKey;
        }

        [TearDown]
        public void TearDown()
        {
            // re-init to clear all mock data
            Initialize();
        }

        #endregion

        #region metadata tests

        [TestCase]
        public void Can_ReInitializeMetadata()
        {
            Angle angle;
            _testingBusinessLogic.ReInitializeProcessingModel();

            Assert.IsFalse(_testingBusinessLogic.TryGetAngle(_testingCompositeKey, out angle),
                "After re-initialize metadata should have no angle(s), but it still contains angle {0}", _testingAngle.id);
            Assert.IsFalse(_testingBusinessLogic.GetAngles() != null && _testingBusinessLogic.GetAngles().Any(),
                "After re-initialize metadata should have no any angle(s)");
        }

        [TestCase]
        public void Can_SyncMetadata()
        {
            _appServerProxy.Setup(x => x.LoginUser(It.IsAny<User>())).Returns(true);

            _testingBusinessLogic = new MasterEdmModelBusinessLogic(
                _appServerProxy.Object,
                _mockAngleDataCollector.Object);

            Assert.IsTrue(_testingBusinessLogic.SyncModelMetadata());
            Assert.AreEqual(EdmModelStatus.Up, EdmModelContainer.Status,
                "When have metadata, its status should be up");
        }

        [TestCase]
        public void Can_HandleSyncMetadataException()
        {
            _appServerProxy.Setup(x => x.LoginUser(It.IsAny<User>())).Returns(true);

            _testingBusinessLogic = new MasterEdmModelBusinessLogic(
                _appServerProxy.Object,
                new Mock<IAngleDataCollector>().Object);

            EdmModelContainer.Metadata[ModelType.Master] = null;
            Assert.IsFalse(_testingBusinessLogic.SyncModelMetadata());
            Assert.AreEqual(EdmModelStatus.Down, EdmModelContainer.Status,
                "When have no metadata, its status should be down");
        }

        [TestCase]
        public void Can_SetCurrentInstance()
        {
            Assert.IsTrue(_testingBusinessLogic.TrySetMetadataCurrentInstance(_context.Object.User, out string currentInstance),
                "Can set current instance properly");
            Assert.AreEqual(currentInstance, EdmModelContainer.Metadata[ModelType.Master].CurrentInstance,
                "Current instance should setup correctly");
        }

        [TestCase]
        public void Can_GetCurrentInstance()
        {
            Assert.IsTrue(_testingBusinessLogic.TrySetMetadataCurrentInstance(_context.Object.User, out string currentInstance),
                "Can set current instance properly");

            string gettingInstance = _testingBusinessLogic.GetCurrentInstance();
            Assert.AreEqual(currentInstance, gettingInstance,
                "Current instance should setup correctly");
        }

        [TestCase(true)]
        [TestCase(false)]
        [TestCase(null)]
        public void Can_CheckIsAppServerAvailable(bool? retryChecking)
        {
            bool isAvailable = retryChecking.HasValue ?
                               _testingBusinessLogic.IsAppServerAvailable(_context.Object.User, retryChecking.Value) :
                               _testingBusinessLogic.IsAppServerAvailable(false);
            Assert.IsTrue(isAvailable, "Checking availability retrying '{0}' should works properly", retryChecking.ToString());
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Can_CheckAppServer_IsNoT_Available(bool retryChecking)
        {
            string mockInstance = string.Empty;
            _appServerProxy.Setup(x => x.TryGetCurrentInstance(It.IsAny<User>(), out mockInstance)).Returns(false);

            bool isAvailable = _testingBusinessLogic.IsAppServerAvailable(new Mock<IContext>().Object.User, retryChecking);
            Assert.IsFalse(isAvailable);
            Assert.AreEqual(EdmModelStatus.Down, EdmModelContainer.Status,
                "Model metadata should be down.");
        }

        [TestCase]
        public void Can_GetUnavailableItems()
        {
            Angle angle = new Angle { uri = "models/1/angles/123" };
            Display display = new Display { uri = "models/1/angles/123/displays/321" };

            display.SetAsUnavailable();
            angle.SetAsUnavailable();
            angle.display_definitions = new List<Display> { display };

            EdmModelContainer.Metadata[ModelType.Master].Angles.TryAdd(angle.CompositeKey, angle);

            // count by separately
            Assert.AreEqual(1, _testingBusinessLogic.CountUnavailableAngles());
            Assert.AreEqual(1, _testingBusinessLogic.CountUnavailableDisplays());
        }

        [TestCase]
        public void Can_SetAngleDisplayDescriptor()
        {
            string entitySetName = "entity_set_name";
            HttpControllerDescriptor descriptor = new HttpControllerDescriptor();
            _testingBusinessLogic.SetAngleDisplayDescriptor(entitySetName, descriptor);

            HttpControllerDescriptor gettingDescriptor;
            Assert.IsTrue(_testingBusinessLogic.GetAngleDisplayDescriptor(entitySetName, out gettingDescriptor),
                "Descriptor {0} should be exist", entitySetName);
        }

        [TestCase]
        public void Can_SetModelAnnotationValue()
        {
            Field field = new Field { id = "invalid:id", short_name = "field_short_name" };
            string structureKey = field.id.Replace(":", "_");
            string nameSpace = "http://everyangle.org/schema";

            EdmPrimitiveTypeKind? kind = EdmPrimitiveConvert.GetKind(field);
            IEdmStringTypeReference edmStringType = EdmCoreModel.Instance.GetString(true);

            EdmEntityType displayEntityType = new EdmEntityType("EA", "display_id");
            EdmStructuralProperty prop = displayEntityType.AddStructuralProperty(structureKey, kind.Value);

            _testingBusinessLogic.SetModelAnnotationValue(prop, nameSpace, "ShortName", new EdmStringConstant(edmStringType, field.short_name));

            EdmModel edmModel = _testingBusinessLogic.GetEdmModel();
            Assert.IsNotNull(edmModel, "Edm model should not be null");

            EdmStringConstant annotationValue = edmModel.GetAnnotationValue(prop, nameSpace, "ShortName") as EdmStringConstant;
            Assert.IsNotNull(annotationValue,
                "Annotation object should not be null");
            Assert.AreEqual(EdmValueKind.String, annotationValue.ValueKind,
                "Field primitive value type should be the same");
            Assert.AreEqual(EdmExpressionKind.StringConstant, annotationValue.ExpressionKind,
                "Field primitive expression type should be the same");
        }

        [TestCase]
        public void Can_AddDisplayEntityModel()
        {
            string displayType = "display_entity_type";
            EdmEntityType displayEntityType = new EdmEntityType("EA", displayType);
            _testingBusinessLogic.AddDisplayEntityModel(displayEntityType);

            EdmModel edmModel = _testingBusinessLogic.GetEdmModel();
            Assert.IsNotNull(edmModel, "Edm model should not be null");

            Assert.AreEqual(2, edmModel.SchemaElements.Count(), "SchemaElements should be updated to 2 elements");
            Assert.AreEqual(displayType, edmModel.SchemaElements.Last().Name, "Latest saved schema element should be {1}", displayType);
        }

        [TestCase]
        public void Can_AddAngleDisplayEntitySet()
        {
            string displayType = "display_entity_type";
            EdmEntityType displayEntityType = new EdmEntityType("EA", displayType);
            _testingBusinessLogic.AddAngleDisplayEntitySet(displayType, displayEntityType);

            IEdmModelMetadata modelMetadata = EdmModelContainer.Metadata[ModelType.Master];
            Assert.IsNotNull(modelMetadata, "Edm model metadata should not be null");

            IEdmEntitySet entitySet = modelMetadata.Container.FindEntitySet(displayType);
            Assert.IsNotNull(entitySet, "Display entity set {0} should be exist", entitySet.Name);
        }

        [TestCase]
        public void Can_ClearUnusedMemory()
        {
            decimal currentMem = _testingBusinessLogic.GetTotalMemory();
            _testingBusinessLogic.ClearUnusedMemory();
            decimal clearedMem = _testingBusinessLogic.GetTotalMemory();

            Assert.IsTrue(currentMem > clearedMem);
        }

        [TestCase]
        public void Can_GetTotalUsingMemory()
        {
            Assert.IsNotNull(_testingBusinessLogic.GetTotalMemory());
        }

        [TestCase]
        public void Can_UpdateLastSyncMetadataTimestamp()
        {
            _testingBusinessLogic.UpdateLastSyncMetadataTimestamp();
            Assert.IsNotNull(EdmModelContainer.LastSyncMetadataTimestamp);
        }

        #endregion

        #region angle tests

        [TestCase]
        public void Can_CountAnglesCorrectly()
        {
            Angle availableAngle = new Angle { uri = "models/1/angles/123" };
            Angle unavailableAngle = new Angle { uri = "models/1/angles/321" };

            unavailableAngle.SetAsUnavailable();

            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(availableAngle.CompositeKey, availableAngle));
            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(unavailableAngle.CompositeKey, unavailableAngle));

            Assert.AreEqual(2, _testingBusinessLogic.CountAngles());
            Assert.AreEqual(1, _testingBusinessLogic.CountAvailableAngles());
            Assert.AreEqual(1, _testingBusinessLogic.CountUnavailableAngles());
        }

        [TestCase]
        public void Can_GetAvailableAnglesCorrectly()
        {
            Angle availableAngle = new Angle { uri = "models/1/angles/123" };
            Angle unavailableAngle = new Angle { uri = "models/1/angles/321" };
            Display display = new Display { uri = "models/1/angles/123/displays/321" };

            availableAngle.display_definitions = new List<Display> { display };
            unavailableAngle.SetAsUnavailable();

            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(availableAngle.CompositeKey, availableAngle));
            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(unavailableAngle.CompositeKey, unavailableAngle));

            Assert.AreEqual(1, _testingBusinessLogic.GetAvailableAngles().Count());
        }

        #endregion

        #region display tests

        // Define a new test from Angles collection
        [TestCase]
        public void Can_CountDisplaysCorrectly()
        {
            Angle angle = new Angle { uri = "models/1/angles/123" };
            Display availableDisplay = new Display { uri = "models/1/angles/123/displays/321" };
            Display unavailableDisplay = new Display { uri = "models/1/angles/123/displays/111" };

            unavailableDisplay.SetAsUnavailable();
            angle.display_definitions = new List<Display> { availableDisplay, unavailableDisplay };

            Assert.IsTrue(_testingBusinessLogic.TrySaveAngle(angle.CompositeKey, angle));

            Assert.AreEqual(2, _testingBusinessLogic.CountDisplays());
            Assert.AreEqual(1, _testingBusinessLogic.CountAvailableDisplays());
            Assert.AreEqual(1, _testingBusinessLogic.CountUnavailableDisplays());
        }

        #endregion

        #region field tests

        [TestCase]
        public void Can_SaveField()
        {
            Field field = new Field { uri = "models/1/instances/1/fields/123", id = "testing_field_Can_SaveField" };
            FieldCompositeKey fieldKey = field.CompositeKey;

            Assert.AreEqual(123, fieldKey.InternalId);
            Assert.AreEqual(field.uri, fieldKey.Uri);
            Assert.AreEqual(field.id, fieldKey.BusinessId);

            _testingBusinessLogic.TrySaveField(fieldKey, field);
            Assert.IsTrue(EdmModelContainer.Metadata[ModelType.Master].Fields.Any());
            Assert.AreEqual(1, EdmModelContainer.Metadata[ModelType.Master].Fields.Count);
        }

        [TestCase]
        public void Can_GetField()
        {
            Field field = new Field { uri = "models/1/instances/1/fields/321", id = "testing_field_Can_GetField" };
            FieldCompositeKey fieldKey = field.CompositeKey;
            
            _testingBusinessLogic.TrySaveField(fieldKey, field);
            Assert.IsTrue(_testingBusinessLogic.TryGetField(fieldKey, out Field gettingField));
            Assert.IsNotNull(gettingField);
        }

        [TestCase]
        public void Can_GetField_With_UniqueCompositKey()
        {
            Field fieldDash = new Field { uri = "models/1/instances/1/fields/111", id = "testing-field-Can-GetField" };
            Field fieldColon = new Field { uri = "models/1/instances/1/fields/222", id = "testing:field:Can:GetField" };

            fieldDash.UpdateUniqueXMLElementKey(fieldDash.AsXMLElementName());
            FieldCompositeKey fieldDashKey = fieldDash.CompositeKey;
            Assert.AreEqual("testing-field-Can-GetField", fieldDashKey.UniqueXMLElementKey);
            
            fieldColon.UpdateUniqueXMLElementKey(fieldColon.AsXMLElementName());
            FieldCompositeKey fieldColonKey = fieldColon.CompositeKey;
            Assert.AreEqual("testing_x003A_field_x003A_Can_x003A_GetField", fieldColonKey.UniqueXMLElementKey);

            _testingBusinessLogic.TrySaveField(fieldDashKey, fieldDash);
            _testingBusinessLogic.TrySaveField(fieldColonKey, fieldColon);
            
            Assert.AreEqual(true, _testingBusinessLogic.TryGetField(fieldDashKey, out Field testingFieldDash));
            Assert.IsNotNull(testingFieldDash);
            
            Assert.AreEqual(true, _testingBusinessLogic.TryGetField(fieldColonKey, out Field testingfieldColon));
            Assert.IsNotNull(testingfieldColon);

            Assert.AreEqual("testing-field-Can-GetField", testingFieldDash.id);
            Assert.AreEqual("testing:field:Can:GetField", testingfieldColon.id);
        }

        [TestCase]
        public void Can_CountFieldsCorrectly()
        {
            Field availableField = new Field { uri = "models/1/instances/1/fields/123", id = "testing-availablefield" };
            Field unavailableField = new Field { uri = "models/1/instances/1/fields/321", id = "testing-unavailablefield" };
            availableField.UpdateUniqueXMLElementKey(availableField.AsXMLElementName());
            unavailableField.UpdateUniqueXMLElementKey(unavailableField.AsXMLElementName());
            FieldCompositeKey availableFieldKey = availableField.CompositeKey;
            FieldCompositeKey unavailableFieldKey = unavailableField.CompositeKey;

            unavailableField.SetAsUnavailable();

            Assert.IsTrue(_testingBusinessLogic.TrySaveField(availableFieldKey, availableField));
            Assert.IsTrue(_testingBusinessLogic.TrySaveField(unavailableFieldKey, unavailableField));

            Assert.AreEqual(2, _testingBusinessLogic.CountFields());
            Assert.AreEqual(1, _testingBusinessLogic.CountAvailableFields());
            Assert.AreEqual(1, _testingBusinessLogic.CountUnavailableFields());
        }

        #endregion
    }
}
