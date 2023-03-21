import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import "./Input.css";
import cookie from "universal-cookie";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fontawesome from "@fortawesome/fontawesome"
import {faPenSquare, faTrash} from '@fortawesome/fontawesome-free-solid';
import Tesseract from 'tesseract.js';
import swal from 'sweetalert';

fontawesome.library.add(faPenSquare, faTrash)

function Input() {
    const [mk, setMk] = useState([]);
    const [hari, setHari] = useState('Senin');
    const [jam, setJam] = useState('');
    const [kelas, setKelas] = useState('');
    const [kode, setKode] = useState('');
    const [sks, setSks] = useState(0);
    const [isEdit, setIsEdit] = useState(false);
    const [id, setId] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [fileUpload, setFileUpload] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [resultTesseract, setResultTesseract] = useState([]);
    const [isSuccessSave, setIsSuccessSave] = useState(false);
    const Cookies = new cookie();

    useEffect(() => {
      if(mk.length >= 0){
        const hari = ['Selasa', 'Senin', 'Rabu', 'Kamis', "Jum'at"];
        let jadwal = [];
        hari.forEach(day => {
          if(Cookies.get(`dataKRS${day}`)){
            let data = atob(Cookies.get(`dataKRS${day}`));
            if(data !== "undefined"){
              data = JSON.parse(data);
              jadwal = [...jadwal, ...data];             
            }
          }
        })
        setMk([...jadwal])
      }
      const handleWindowResize = () => {
        setWindowWidth(window.innerWidth);
      }
    
      window.addEventListener('resize', handleWindowResize);
    
      return () => {
        window.removeEventListener('resize', handleWindowResize);
      }
    }, [])

    useEffect(() => {
      let dataOCR = [];
      resultTesseract.forEach(matkul => {
        let mkSplit = matkul.split(" ");
        let sksOCR = 0;
        if(mkSplit.length > 5)
        {          
          for (let i = 0; i < mkSplit.length; i++) {
            if(mkSplit[i] == "|" || mkSplit[i] == ""
            || mkSplit[i] == "~" || mkSplit[i] == "=") {
              mkSplit.splice(i, 1);
            }
            else if(mkSplit[i].indexOf("|")){
              mkSplit[i] = mkSplit[i].replace("|", "");
            }
            if(i == 0){
              if(mkSplit[i] == "Jumat" || mkSplit[i] == "Jumiat") 
              mkSplit[i] = "Jum'at"
            }
            if(i == 1) {
              let pattern = /[01][0-9]:[0-5][0-9]-[01][0-9]:[0-5][0-9]/
              let pattern2 = /[01][0-9]:[0-5][0-9]/
              let pattern3 = /[01][0-9][0-5][0-9]/
              if(mkSplit[i].match(pattern) == null){
                if(mkSplit[i].match(pattern2) != null || mkSplit[i].match(pattern3) != null){
                  if(mkSplit[i + 1] == "-"){
                    mkSplit[i] = mkSplit[i] + mkSplit.splice((i+1), 1) + mkSplit.splice((i+1), 1)
                  }else if(mkSplit[i].indexOf("-")){
                    mkSplit[i] = mkSplit[i] + mkSplit.splice((i+1), 1)
                  }
                }   
              }
            }
            if(i > 3){
              if(parseInt(mkSplit[i]) != NaN){
                if(parseInt(mkSplit[i]) <= 7 && mkSplit[i].indexOf("0") < 0){
                  sksOCR = mkSplit[i];
                }
              }
            }
          }
          const matKul = {
            hari: mkSplit[0],
            jam: mkSplit[1],
            kelas: mkSplit[2],
            kode: mkSplit[3],
            sks: sksOCR,
          }
          dataOCR.push(matKul);
        }
      })
      if(dataOCR.length > 0){
        setMk([...mk, ...dataOCR]);
        setResultTesseract([])
      }
    }, [resultTesseract])

    const addMk = (e) => {
        e.preventDefault();
        const matKul = {
          hari: hari,
          jam: jam,
          kelas: kelas,
          kode: kode,
          sks: sks,
        }
        setMk([...mk, matKul]);
        setHari('Senin');
        setJam('');
        setKelas('');
        setKode('');
        setKode(0);
      }
    
      const editMk = (id) => {
        setHari(mk[id].hari);
        setJam(mk[id].jam);
        setKelas(mk[id].kelas);
        setKode(mk[id].kode);
        setSks(mk[id].sks);
        setIsEdit(true);
        setId(id);
        window.scrollTo(0, 0)
      }
    
      const saveMk = (e) => {
        e.preventDefault();
        mk[id].hari = hari;
        mk[id].jam = jam;
        mk[id].kelas = kelas;
        mk[id].kode = kode;
        mk[id].sks = sks;
        setMk(mk);
        setHari('Senin');
        setJam('');
        setKelas('');
        setKode('');
        setSks(0);
        setIsEdit(false)
      }
    
      const deleteMk = (id) => {
        const matkul = [...mk];
        matkul.splice(id, 1);
        setMk(matkul);
      }
    
      const saveKRS = () => {
        for (let i = 0; i < [...mk].length; i++) {
          if(mk[i].sks == null) {
            mk[i].sks = 0;
          }          
        }
        const hari = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"];
        let jadwal = [];
        mk.forEach(matkul => {
          if(!Array.isArray(jadwal[hari.indexOf(matkul.hari)])){
            jadwal[hari.indexOf(matkul.hari)] = []
          }
          jadwal[hari.indexOf(matkul.hari)].push(matkul);
        });
        for (let i = 0; i < 4; i++) {
          Cookies.set('dataKRS'+hari[i], btoa(JSON.stringify(jadwal[i])), {path: '/'});
        }
        setIsSuccessSave(true);
      }

      const deleteKRS = () => {
        swal({
          title: "Kamu yakin?",
          text: "Penghapusan ini akan permanen, sekali kamu menghapus, itu takkan kembali",
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
        .then((willDelete) => {
          if (willDelete) {
            swal("Selesai! semua data telah terhapus", {
              icon: "success",
            });
            setMk([])
            Cookies.set('dataKRS', btoa(JSON.stringify([])), {path: '/'});
          } else {
            swal("Datamu masih aman!");
          }
        });
      }

      const IconAksi = (index) => {
        return  <div>
                  <button title='Edit' onClick={() => editMk(index)}><FontAwesomeIcon icon="fa-solid fa-pen-square" /></button>
                  <button title='Delete' onClick={() => deleteMk(index)}><FontAwesomeIcon icon="fa-solid fa-trash" /></button>
                </div>
      }

      const TextAksi = (index) => {
        return  <div>
                  <button onClick={() => editMk(index)}>Edit</button>
                  <button onClick={() => deleteMk(index)}>Delete</button>
                </div>
      }

      const ocrImage = (image = []) => {
        const recognizedFile = (index) => {
          Tesseract.recognize(
            image[index],
            'eng',
            {
              logger: m => {
                setProgress(Math.round(m.progress*100))
              },
              langPath: "ind.traineddata"
            }
          ).then((result) => {
            setIsSuccess(true);
            const ocrSplit = result.data.text.split("\n");
            let jadwalOCR = [];
            for (let i = 0; i < ocrSplit.length; i++) {
              if(ocrSplit[i].indexOf("Jumat") >= 0 || ocrSplit[i].indexOf("Jumiat") >= 0 ||
                ocrSplit[i].indexOf("Jum'at") >= 0 || ocrSplit[i].indexOf("Senin") >= 0 ||
                ocrSplit[i].indexOf("Selasa") >= 0 || ocrSplit[i].indexOf("Rabu") >= 0 ||
                ocrSplit[i].indexOf("Kamis") >= 0){
                  jadwalOCR.push(ocrSplit[i]);
              }
            }
            setResultTesseract(jadwalOCR)
          })
        }
        recognizedFile(0)
      }

      const allowDrop = (ev) => {
        ev.preventDefault();
      }

      const drop = (ev) => {
        ev.preventDefault();
        var data = ev.dataTransfer.files;
        setFileUpload(data)
      }

  return (
    <div className='input'>
      <div className="top"></div>
      {
        isSuccessSave ? (
          <div className="alert-box">
            <div className="alert alert-success">
              <a className="close" onClick={() => setIsSuccessSave(false)}>&times;</a>
              <strong>Success!</strong> Jadwal telah disimpan
            </div>
          </div>
        ) : null
      }
      <div className="data-input">
        <div className="top-button">
          <button type="button" className="btn btn-primary openModal" data-toggle="modal" data-target="#myModal">
            Upload File
          </button>
          <div className="krs-button">
            <button type="button" onClick={() => saveKRS()} className="btn btn-primary openModal">
              Save KRS
            </button>
            <button type="button" onClick={() => deleteKRS()} className="btn btn-primary openModal">
              Delete All KRS
            </button>
          </div>
          <div className="modal fade" id="myModal" role="dialog" aria-hidden='true'>
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Modal Header</h4>
                </div>
                <div className="modal-body">
                  <p style={{color: 'red'}}>Warning!! Pengambilan data berdasarkan gambar tidak dapat 100% akurat.</p>
                  <div className="file-drop-area">
                    <input id='upload' 
                    type="file" 
                    accept='image/*' 
                    onChange={(e) => setFileUpload(e.target.files)}/>
                    <label htmlFor='upload' title='Upload disini' onDrop={(e) => {drop(e)}} onDragOver={(e) => allowDrop(e)}>Upload disini</label>
                  </div>
                  {
                    fileUpload.length > 0 ? 
                    (
                      <div>
                        <p style={{margin: '10px 0 5px 0'}}>File yang kamu upload :</p>
                        <ul>
                          {
                            [...fileUpload].map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))
                          }
                        </ul>
                      </div>
                    )
                     : null
                  }
                </div>
                <div className="modal-footer">
                  <div className='progress' style={{background: `linear-gradient(90deg, #24ec7e ${progress}%, #e7e7e7 0%)`, marginRight: (isSuccess? "5px": "auto")}}></div>
                  {isSuccess? (<p style={{marginRight: 'auto'}}>Success</p>) : null}
                  <button type="button" className="btn btn-primary" onClick={() => ocrImage([...fileUpload])}>Upload</button>
                  <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={isEdit? saveMk : addMk} className='form-add-mk' >
          <div className="input-form">
            <div className="control">
              <label className="label">Hari</label>
              <select
              value={hari}
              onChange={(e) => setHari(e.target.value)}>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jum'at">Jum'at</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>
            </div>
            <div className="control">
              <label className="label">Jam</label>
              <input type="text" maxLength={'11'} className="jamMK" 
              placeholder='04:00-07:00'
              onChange={(e) => setJam(e.target.value)}
              value={jam}
              required
              />
            </div>
            <div className="control">
              <label className="label">Kelas</label>
              <input type="text" maxLength={'15'} className="kelasMK"
              placeholder='B' 
              onChange={(e) => setKelas(e.target.value)}
              value={kelas}
              required
              />
            </div>
            <div className="control">
              <label className="label">Kode</label>
              <input type="text" maxLength={'10'} className="kodeMK" 
              placeholder='UBU80003'
              onChange={(e) => setKode(e.target.value)}
              value={kode}
              required
              />
            </div>
            <div className="control">
              <label className="label">SKS</label>
              <input type="number" max={7} maxLength={1} className="sksMK" 
              placeholder='3'
              onChange={(e) => {
                const tempSks = parseInt(e.target.value);
                setSks(tempSks);
              }}
              value={sks}
              required
              />
            </div>
          </div>
          <div className="btn-add-save">
            <div className="control">
              <button type='submit'>{isEdit? 'Simpan' : 'Tambah'} Mata Kuliah</button>
            </div>
          </div>
        </form>
        <table className="data-mk">
          <thead>
            <tr>
              <th>Hari</th>
              <th>Jam</th>
              <th>Kelas</th>
              <th>Kode</th>
              <th>sks</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mk && mk.map((cell, index) => (
            <tr key={index}>
              <td>{cell.hari}</td>
              <td>{cell.jam}</td>
              <td>{cell.kelas}</td>
              <td>{cell.kode}</td>
              <td>{cell.sks}</td>
              <td>
                {(windowWidth > 700) ? TextAksi(index) : IconAksi(index)}
              </td>
            </tr>
            ))}
          </tbody>
        </table>
        <div className="gen-btn">
          <Link to={'/tabel'} className='generate-btn'>Generate</Link>
        </div>
      </div>
    </div>
  )
}

export default Input