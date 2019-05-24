using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using Ionic.Zip;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;

namespace EveryAngle.WebClient.Web.Helpers
{
    public class ItemImporter
    {
        readonly Stream _stream;

        public ItemImporter(Stream stream)
        {
            _stream = stream;
        }

        public List<T> GetContents<T>(string selectionCriteria) where T : class
        {
            List<T> contents = new List<T>();
            _stream.Position = 0;
            using (ZipFile zip = ZipFile.Read(_stream))
            {
                foreach (ZipEntry entry in zip.SelectEntries(selectionCriteria))
                {
                    MemoryStream ms = new MemoryStream();
                    entry.Extract(ms);
                    ms.Position = 0;

                    T content = GetObjectFromStream<T>(ms);
                    contents.Add(content);
                }
            }
            return contents;
        }

        public static T GetObjectFromStream<T>(Stream stream) where T : class
        {
            string content = new StreamReader(stream).ReadToEnd();
            return JsonConvert.DeserializeObject<T>(content);
        }
    }
}
