using EveryAngle.ManagementConsole.Helpers;
using NUnit.Framework;
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class OutputFilterStreamTests : UnitTestBase
    {
        #region private variables

        private OutputFilterStream _outputFilterStream;
        private readonly string _testFilePath = AppDomain.CurrentDomain.BaseDirectory + "TestResources\\test_image.png";

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            base.Setup();
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_InitializeOutputFilterStream()
        {
            using (Image image = Image.FromFile(_testFilePath))
            using (MemoryStream stream = new MemoryStream())
            {
                image.Save(stream, ImageFormat.Png);
                stream.Position = 99;

                // assert
                _outputFilterStream = new OutputFilterStream(stream);
                Assert.AreEqual(true, _outputFilterStream.CanRead);
                Assert.AreEqual(true, _outputFilterStream.CanSeek);
                Assert.AreEqual(false, _outputFilterStream.CanTimeout);
                Assert.AreEqual(true, _outputFilterStream.CanWrite);
                Assert.AreEqual(3209, _outputFilterStream.Length);
                Assert.AreEqual(99, _outputFilterStream.Position);
            }
        }

        [TestCase]
        public void Can_Flush()
        {
            using (Image image = Image.FromFile(_testFilePath))
            using (MemoryStream stream = new MemoryStream())
            {
                image.Save(stream, ImageFormat.Png);
                stream.Position = 99;

                // assert
                _outputFilterStream = new OutputFilterStream(stream);
                _outputFilterStream.Flush();
            }
        }

        [TestCase]
        public void Can_ReadStream()
        {
            using (Image image = Image.FromFile(_testFilePath))
            using (MemoryStream stream = new MemoryStream())
            {
                image.Save(stream, ImageFormat.Png);
                stream.Position = 99;

                // assert
                _outputFilterStream = new OutputFilterStream(stream);
                Assert.IsNullOrEmpty(_outputFilterStream.ReadStream());
            }
        }

        [TestCase]
        public void Can_Read()
        {
            using (Image image = Image.FromFile(_testFilePath))
            using (MemoryStream stream = new MemoryStream())
            {
                image.Save(stream, ImageFormat.Png);
                stream.Position = 99;

                // assert
                byte[] bytes = stream.GetBuffer();
                _outputFilterStream = new OutputFilterStream(stream);
                Assert.IsTrue(_outputFilterStream.Read(bytes, 0, (int)_outputFilterStream.Length) > 0);
            }
        }

        [TestCase]
        public void Can_Seek()
        {
            using (Image image = Image.FromFile(_testFilePath))
            using (MemoryStream stream = new MemoryStream())
            {
                image.Save(stream, ImageFormat.Png);
                stream.Position = 99;

                // assert
                _outputFilterStream = new OutputFilterStream(stream);
                Assert.AreEqual(99, _outputFilterStream.Seek(0, SeekOrigin.Current));
            }
        }

        [TestCase]
        public void Can_SetLength()
        {
            using (Image image = Image.FromFile(_testFilePath))
            using (MemoryStream stream = new MemoryStream())
            {
                image.Save(stream, ImageFormat.Png);
                stream.Position = 99;

                // assert
                _outputFilterStream = new OutputFilterStream(stream);
                _outputFilterStream.SetLength(100);
            }
        }

        [TestCase]
        public void Can_Write()
        {
            using (Image image = Image.FromFile(_testFilePath))
            using (MemoryStream stream = new MemoryStream())
            {
                image.Save(stream, ImageFormat.Png);
                stream.Position = 99;

                // assert
                byte[] bytes = stream.GetBuffer();
                _outputFilterStream = new OutputFilterStream(stream);
                _outputFilterStream.Write(bytes, 0, (int)_outputFilterStream.Length);
            }
        }

        #endregion

        #region private/protected functions

        #endregion
    }
}
