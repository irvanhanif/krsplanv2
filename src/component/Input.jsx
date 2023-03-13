import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import "./Input.css";
import cookie from "universal-cookie";

function Input() {
    const [mk, setMk] = useState([]);
    const [hari, setHari] = useState('Senin');
    const [jam, setJam] = useState('');
    const [kelas, setKelas] = useState('');
    const [kode, setKode] = useState('');
    const [sks, setSks] = useState(0);
    const [isEdit, setIsEdit] = useState(false);
    const [id, setId] = useState(0);
    const Cookies = new cookie();

    useEffect(() => {
      if(Cookies.get('data')){
        const data = JSON.parse(atob(Cookies.get('data')));
        setMk(data);
      }
    }, [])

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
    
      const generate = () => {
        Cookies.set('data', btoa(JSON.stringify(mk)), {path: '/'});
      }

  return (
    <div className='input'>
      <div className="top"></div>
      <div className="data-input">
        <form onSubmit={isEdit? saveMk : addMk} className='form-add-mk' >
          <div className="input-form">
            {/* <div className="top-form"> */}
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
            {/* </div> */}
            {/* <div className="bottom-form"> */}
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
                onChange={(e) => setSks(e.target.value)}
                value={sks}
                required
                />
              </div>
            </div>
          {/* </div> */}
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
                <button onClick={() => editMk(index)}>Edit</button>
                <button onClick={() => deleteMk(index)}>Delete</button>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
        <div className="gen-btn">
          <Link to={'/tabel'} onClick={() => generate()} className='generate-btn'>Generate</Link>
        </div>
      </div>
    </div>
  )
}

export default Input