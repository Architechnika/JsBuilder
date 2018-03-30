using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;

namespace JsBuilder
{
    class Program
    {

        static string resultFile = "jsbuilderscript.js";
        static string firstInpFile = "game.html";
        static string secondInpFile = "index.html";

        static void Main(string[] args)
        {
            //Обрабатываем файл firstInpFile
            processGAMEHTML();
            //Обрабатываем файл secondInpFile
            processINDEXHTML();
        }

        static void processINDEXHTML()
        {
            List<string> fStrings = new List<string>();
            using (StreamReader sr = new StreamReader(secondInpFile))
            {
                String line;
                while ((line = sr.ReadLine()) != null)
                {
                    fStrings.Add(line);
                }
            }

            var versionString = "1.0." + DateTime.Now.ToString("yyyy") + DateTime.Now.ToString("MM") + DateTime.Now.ToString("dd");

            for(int i = 0; i < fStrings.Count; i++)
            {
                var splitted = fStrings[i].Split(new string[] { "var currentVersion = \"" }, StringSplitOptions.None);
                if (splitted.Length > 1)
                {
                    fStrings[i] = splitted[0] + "var currentVersion = \"" + versionString + "\";";
                }
            }
            using (StreamWriter wr = new StreamWriter(secondInpFile))
            {
                foreach(var str in fStrings)
                {
                    wr.WriteLine(str);
                }
            }

        }

        static void processGAMEHTML()
        {
            string inpFile = firstInpFile;
            //Читаем все имена файлов js скриптов включенных в исходный html
            List<string> allFiles = parseInputFile(inpFile);
            //Очищаем или создаем файл для результата обработки
            clearFile(resultFile);
            //Для каждого файла считываем его текст и добавляем в результирующий файл
            foreach (string file in allFiles)
                addToFile(resultFile, readFileToEnd(file));
        }

        static List<string> parseInputFile(string inpFile)
        {
            List<string> inpStrgs = new List<string>();
            List<string> result = new List<string>();
            using (StreamReader sr = new StreamReader(inpFile))
            {
                String line;
                // Read and display lines from the file until the end of
                // the file is reached.
                while ((line = sr.ReadLine()) != null)
                {
                    inpStrgs.Add(line);
                }
            }
            foreach(var str in inpStrgs)
            {
                var splitted = str.Split(new[] { "></script>" }, StringSplitOptions.None);
                if(str.Length > 0)
                {
                    var splitted2 = splitted[0].Split(new[] { "src=" }, StringSplitOptions.None);
                    
                    if(splitted2.Length > 1)
                    {
                        splitted2[1] = splitted2[1].Substring(1);
                        splitted2[1] = splitted2[1].Substring(0,splitted2[1].Length - 1);
                        result.Add(splitted2[1]);
                    }
                }
            }
            return result;
        }
        //----------------------------Вспомогательные методы*--------------------
        static void addToFile(string filePath, string data)
        {
            try
            {
                using (StreamWriter wr = new StreamWriter(filePath, true))
                    wr.WriteLine(data);
            }
            catch (Exception ex)
            {
                write(ex.Message);
                Console.ReadKey();
                Environment.Exit(-1);
            }
        }

        static void clearFile(string fPath)
        {
            try
            {
                if (!File.Exists(fPath))
                {
                    addToFile(fPath, "");
                }

                FileStream fileStream = File.Open(fPath, FileMode.Open);
                fileStream.SetLength(0);
                fileStream.Close();
            }
            catch (Exception ex)
            {
                write(ex.Message);
                Console.ReadKey();
                Environment.Exit(-1);
            }
        }

        static string readFileToEnd(string filePath)
        {
            try
            {
                using (StreamReader sr = new StreamReader(filePath))
                    return sr.ReadToEnd();
            }
            catch (Exception ex)
            {
                write(ex.Message);
                Console.ReadKey();
                Environment.Exit(-1);
                return "";
            }
        }

        static string read()
        {
            return Console.ReadLine();
        }

        static void write(string str)
        {
            Console.Write(str);
        }
    }
}
