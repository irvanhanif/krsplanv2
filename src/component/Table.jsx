import React, {useState, useEffect} from 'react'
import cookie from 'universal-cookie'
import './Table.css'

function Table() {
  const [mk, setMk] = useState([]);
  const [data, setData] = useState([]);
  const [sks, setSks] = useState(0);
  const Cookies = new cookie();

  useEffect(() => {
    setMk(JSON.parse(atob(Cookies.get('data'))));
  }, []);

  const convertTimetoInt = (time, i) => {
    const timeSplit = time.jam.split("-")[i];
    const jam = parseInt(timeSplit.split(timeSplit.indexOf(":") > 0 ? ":" : "." )[0]) * 60;
    const menit = parseInt(timeSplit.split(timeSplit.indexOf(":") > 0 ? ":" : "." )[1]);
    return jam + menit;
  }

  const getMKperDaysFromJadwal = (array = [], day) => {
    return array.filter(matkul => {
      if(matkul.hari == day) {
        return matkul;
      }
    });
  }

  const getDaysFromJadwal = (jadwal) => {
    const days = [];
    jadwal.forEach(matkul => {
      if(days.indexOf(matkul.hari) < 0){
        days.push(matkul.hari);
      }
    });
    return days;
  }
  
  const getIndexMkByKode = (jadwal = [], mataKuliah) => {
    let indexKey = [];

    const cekSimilarIndex = (idx = [], idxNum, sim) => {
      if(idx.length > 0){
        for (let i = 0; i < idx.length; i++) {
          if(Array.isArray(idx[i])){
            sim = cekSimilarIndex(idx[i], idxNum, sim);
          }else{
            if(idx[i] == idxNum){
              sim = true;
            }
          }
        }
      }
      return sim;
    }
    
    const loopSimilar = (array = [], kode, kelas) => {
      let similar = [];
      array.forEach(matkul => {
        if(matkul.kode == kode && matkul.kelas == kelas){
          similar.push(matkul);
        }
      })
      return similar.length > 1 ? true : false;
    }
    
    jadwal.forEach(matkul => { 
      if(matkul.kode == mataKuliah.kode){
        let tempIndex = [];
        if(loopSimilar(jadwal, matkul.kode, matkul.kelas)){
          for (let i = 0; i < jadwal.length; i++) {
            if(jadwal[i].kode == matkul.kode && jadwal[i].kelas == matkul.kelas){
              if(!cekSimilarIndex(indexKey, jadwal.indexOf(jadwal[i]))){
                tempIndex.push(jadwal.indexOf(jadwal[i]));
              }
            }
          }
        } else {
          if(mataKuliah.kelas != matkul.kelas){
            if(indexKey.length == 0) indexKey.push(jadwal.indexOf(mataKuliah))
              indexKey.push(jadwal.indexOf(matkul));
          }
        }
        if(tempIndex.length > 0){
          indexKey = [...indexKey, tempIndex];
        }
      }
    });
    return indexKey;
  }
  
  const getSimilarMkFromJadwal = (jadwal = []) => {
    let mkSimilar = [], similar = false;
    jadwal.forEach(matkul => {
      if(mkSimilar.length > 0) {
        const len = mkSimilar.length;
        for (let i = 0; i < len ; i++) {
          if(mkSimilar[i].kode == matkul.kode && mkSimilar[i].kelas != matkul.kelas){
            similar = true;
          }
        } 
        if(!similar){
          mkSimilar.push({kode: matkul.kode, kelas: matkul.kelas});
        }
      }else {
        mkSimilar.push({kode: matkul.kode, kelas: matkul.kelas});
      }
    });
    return similar;
  }

  const spliceMkBySimilarKode = (jadwal = []) => {
    let mkSpliceds = [];
    let mkArray = [...jadwal];
    mkArray.forEach(matkul => {
      let indexKode = getIndexMkByKode(mkArray, matkul);
      const tempMK = matkul;
      let batas = indexKode.length;
      
      while (batas > 1) {
        indexKode = getIndexMkByKode(mkArray, tempMK);
        const indexSpliced = indexKode[Math.round(Math.random() * (indexKode.length-1))];
        let mkSpliced = [];
        if(indexSpliced.length > 0){
          for (let j = 0; j < indexSpliced.length; j++) {
            const mkSplicedinLoop = mkArray.splice((indexSpliced[j]-j), 1);
            mkSpliced = [...mkSpliced, ...mkSplicedinLoop];
          }
        }
        else{
          mkSpliced = mkArray.splice(indexSpliced, 1);
        }
        if(mkSpliced.length > 0){
          batas--;
          mkSpliceds = [...mkSpliceds, ...mkSpliced];
        }
      }
    });
    return [mkArray, mkSpliceds];
  }

  const addMKSpliceToJadwal = (jadwal = [], splice = []) => {
    let changeJadwal = false;
    const cekKodeInJadwal = (jadwal = [], mkSplice) => {
      let found = false;
      for (let i = 0; i < jadwal.length; i++) {
        if(jadwal[i].kode == mkSplice.kode && jadwal[i].kelas != mkSplice.kelas){
          found = true;
        }        
      }
      return !found;
    }
    const cekKelasInJadwal = (jadwal = [], mkSplice) => {
      let found = false;
      for (let i = 0; i < jadwal.length; i++) {
        if(jadwal[i].kode == mkSplice.kode && jadwal[i].kelas == mkSplice.kelas &&
          (jadwal[i].jam != mkSplice.jam || jadwal[i].hari != mkSplice.hari)){
          found = true;
        }        
      }
      return found;
    }
    const cekCanAddToJadwal = (jadwal = [], mkSplice, spliced = []) => {
      let canAdd = true;
      const matkul = getMKperDaysFromJadwal(jadwal, mkSplice.hari);
      if(matkul.length > 0){
        for (let i = 0; i < matkul.length-1; i++) {
          if(
            (
              ((convertTimetoInt(mkSplice, 0) <= convertTimetoInt(matkul[i], 1)) &&
              (convertTimetoInt(mkSplice, 1) >= convertTimetoInt(matkul[i+1], 0))) 
            )          
            ){
            canAdd = false;
          }
        }
        if(canAdd && cekKelasInJadwal(spliced, mkSplice)){
          for (let i = 0; i < spliced.length; i++) {
            if(spliced[i].kode == mkSplice.kode && spliced[i].kelas == mkSplice.kelas &&
              (spliced[i].jam != mkSplice.jam || spliced[i].hari != mkSplice.hari)){
              const mkSpliced = getMKperDaysFromJadwal(jadwal, spliced[i].hari);

              for (let j = 0; j < mkSpliced.length-1; j++) {
                if(
                  ((convertTimetoInt(spliced[i], 0) <= convertTimetoInt(mkSpliced[j], 1)) &&
                  (convertTimetoInt(spliced[i], 1) >= convertTimetoInt(mkSpliced[j+1], 0)))
                ){
                  canAdd = false;
                }
              }
            }  
          }
        }
      }
      return canAdd;      
    }

    let batas = 5;
    do{
      if(batas <= 0) break;
      splice.forEach(mkSplice => {
        if(cekKodeInJadwal(jadwal, mkSplice) && cekCanAddToJadwal(jadwal, mkSplice, splice)){
          let spliceSimMk = []
          if(cekKelasInJadwal(splice, mkSplice)){
            for (let i = 0; i < splice.length; i++) {
              if(splice[i].kode == mkSplice.kode && splice[i].kelas == mkSplice.kelas){
                spliceSimMk = [...spliceSimMk, splice[i]];
              }  
            }
          }
          if(spliceSimMk.length > 0){
            jadwal = [...jadwal, ...spliceSimMk]
          }else{
            jadwal = [...jadwal, mkSplice]
          }
          changeJadwal = true;
        }else{
          splice.splice(splice.indexOf(mkSplice), 1);
        }
      })
      batas--;
    }while(splice.length > 0);
    return [changeJadwal, [...jadwal], [...splice]]
  }

  const eliminateMk = (days = [], mkArray = [], mkSpliced = [], hari = []) => {
    const deleteSimilarMk = (mkDay, jadwal = []) => {
      let splicedMatkul = [];
      for (let j = 0; j < jadwal.length; j++) {
        if(mkDay[0].kode == jadwal[j].kode && mkDay[0].kelas == jadwal[j].kelas && 
          (mkDay[0].hari != jadwal[j].hari || mkDay[0].jam != jadwal[j].jam)){
            const mkSplice = jadwal.splice(j, 1);
            splicedMatkul.push(mkSplice[0]);
          }
        }
        return [splicedMatkul, [...jadwal]];
    }

    let simJadwal = [];
    let resultCanAdd = false;
    let fixJadwal;
    fixJadwal = [];

    days.forEach(day => {
      const matkul = getMKperDaysFromJadwal(mkArray, day);
      if(matkul.length > 1) {
        for (let i = 0; i < matkul.length; i++) {
          for (let j = 0; j < matkul.length; j++) {
            if(convertTimetoInt(matkul[i], 0) < convertTimetoInt(matkul[j], 0)){
              const temp = matkul[j];
              matkul[j] = matkul[i];
              matkul[i] = temp;
            }
          }
        }
        for (let i = 0; i < matkul.length; i++) {
          for (let j = i+1; j < matkul.length; j++) {
            if(simJadwal[hari.indexOf(day)]){
              if(Array.isArray(simJadwal[hari.indexOf(day)])){
                for (let k = 0; k < simJadwal.length; k++) {
                  if (matkul[i] != simJadwal[hari.indexOf(day)][k] &&
                    (convertTimetoInt(matkul[i], 0) <= convertTimetoInt(simJadwal[hari.indexOf(day)][k], 0)) &&
                    (convertTimetoInt(matkul[i], 1) >= convertTimetoInt(simJadwal[hari.indexOf(day)][k], 1))){
                    const mkSplice = matkul.splice(i, 1);
                    mkSpliced = [...mkSpliced, ...mkSplice];
                  }
                }
              }else{
                if (matkul[i] != simJadwal[hari.indexOf(day)] &&
                  ((convertTimetoInt(matkul[i], 0) <= convertTimetoInt(simJadwal[hari.indexOf(day)], 0)) &&
                  (convertTimetoInt(matkul[i], 1) >= convertTimetoInt(simJadwal[hari.indexOf(day)], 1)) )){
                  const mkSplice = matkul.splice(i, 1);
                  mkSpliced = [...mkSpliced, ...mkSplice];
                }
              }
            }else if (convertTimetoInt(matkul[j], 0) < convertTimetoInt(matkul[i], 1)) {
                const mkSplice = matkul.splice(Math.round(Math.random()*1) ? i : j, 1);
                mkSpliced = [...mkSpliced, mkSplice[0]];
                let delSimMK = deleteSimilarMk(mkSplice, [...mkArray]);
                if(Array.isArray(delSimMK[0]) && Array.isArray(delSimMK[1])){
                  mkSpliced = [...mkSpliced, ...delSimMK[0]];
                  mkArray = [...delSimMK[1]];
                }
            } else if (i != j && (convertTimetoInt(matkul[i], 0) == convertTimetoInt(matkul[j], 0) || 
              convertTimetoInt(matkul[i], 1) == convertTimetoInt(matkul[j], 1) )) {
              const mkSplice = matkul.splice(Math.round(Math.random()*1) ? i : j, 1);
              mkSpliced = [...mkSpliced, mkSplice[0]];
              let delSimMK = deleteSimilarMk(mkSplice, [...mkArray]);
              if(Array.isArray(delSimMK[0]) && Array.isArray(delSimMK[1])){
                mkSpliced = [...mkSpliced, ...delSimMK[0]];
                mkArray = [...delSimMK[1]];
              }
            }
          }
        }
        matkul.forEach(mkInMatkul => {
          for (let j = 0; j < mkArray.length; j++) {
            if(mkInMatkul.kode == mkArray[j].kode && mkInMatkul.kelas == mkArray[j].kelas && 
              (mkInMatkul.hari != mkArray[j].hari || mkInMatkul.jam != mkArray[j].jam)){
              if(Array.isArray(simJadwal[hari.indexOf(mkArray[j].hari)])){
                simJadwal[hari.indexOf(mkArray[j].hari)] = [...simJadwal[hari.indexOf(mkArray[j].hari)], mkArray[j]];
              }else{
                simJadwal[hari.indexOf(mkArray[j].hari)] = [mkArray[j]];
              }
            }
          }
        })
      }
      fixJadwal = [...fixJadwal, ...matkul];
    })
    resultCanAdd = addMKSpliceToJadwal([...fixJadwal], [...mkSpliced]);
    mkSpliced = [...resultCanAdd[2]];
    if(resultCanAdd[0]){
      mkArray = [...resultCanAdd[1]];
    }
    return {
      fixJadwal: [...fixJadwal],
      mkArray: [...mkArray],
    }
  }

  const inputToTimeJadwal = (mkElminates = [], jamJadwal = [], hari = [], isJumat = false) => {
    let fixJadwal = [];
    for (let i = 0; i < 4; i++) {
      fixJadwal[i] = [];
    }
    mkElminates.fixJadwal.forEach(matkul => {
      let start = false, end = false;
      if(isJumat ? matkul.hari == "Jum'at" : matkul.hari != "Jum'at")
        jamJadwal.forEach(time => {
          if(convertTimetoInt(matkul, 0) == convertTimetoInt({jam: time}, 0)){
            if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
              fixJadwal[hari.indexOf(matkul.hari)] = [];
            }
            start = true;
            fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = matkul;
          }else if(convertTimetoInt(matkul, 1) == convertTimetoInt({jam: time}, 1)){
            if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
              fixJadwal[hari.indexOf(matkul.hari)] = [];
            }
            end = true;
            fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = matkul;
          }else if(
            (convertTimetoInt(matkul, 0) < convertTimetoInt({jam: time}, 0)) &&
            (convertTimetoInt(matkul, 1) > convertTimetoInt({jam: time}, 1))
            ){
              if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
                fixJadwal[hari.indexOf(matkul.hari)] = [];
              }
              fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = matkul;
          }
        })
      if(isJumat ? matkul.hari == "Jum'at" : matkul.hari != "Jum'at")
      {
        if(!start) {
          jamJadwal.forEach(time => {
            if((convertTimetoInt(matkul, 0) > convertTimetoInt({jam: time}, 0)) &&
            (convertTimetoInt(matkul, 0) < convertTimetoInt({jam: time}, 1))){
              if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
                fixJadwal[hari.indexOf(matkul.hari)] = [];
              }
              if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)])){
                fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = [];
              }
              fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = 
              [...fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)], matkul];
            }
          });
        } 
        if(!end){
          jamJadwal.forEach(time => {
            if((convertTimetoInt(matkul, 1) > convertTimetoInt({jam: time}, 0)) &&
            (convertTimetoInt(matkul, 1) < convertTimetoInt({jam: time}, 1))){
              if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
                fixJadwal[hari.indexOf(matkul.hari)] = [];
              }
              if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)])){
                fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = [];
              }
              fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = 
              [...fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)], matkul];
            }
          });
        }
      }
    })
    if(!isJumat && fixJadwal.length > 4) fixJadwal.pop();
    if(!isJumat && fixJadwal.length < 5){
      fixJadwal.forEach(jadwal => {
        if(!jadwal) jadwal = {};
      });
    }
    return (isJumat? (fixJadwal[4] ? fixJadwal[4] : [{}]) : fixJadwal);
  }

  const createJamJadwal = (mkElminates = []) => {
    let listDeltaTime = [], deltaTime = 0;
    mkElminates.fixJadwal.forEach(matkul => {
      const deltaTimeAkumulasi = (convertTimetoInt(matkul, 1) - convertTimetoInt(matkul, 0));
      const isNine = (deltaTimeAkumulasi.toString().substring(0, deltaTimeAkumulasi.toString().length).indexOf("9") > 0) ? 1 : 0;
      let tempDeltaTime = 0;
      if((deltaTimeAkumulasi + isNine) % 4 == 0){
        tempDeltaTime = (deltaTimeAkumulasi+isNine) / 4;
      }else if((deltaTimeAkumulasi + isNine) % 3 == 0){
        tempDeltaTime = (deltaTimeAkumulasi+isNine) / 3;
      }else if((deltaTimeAkumulasi + isNine) % 2 == 0){
        tempDeltaTime = (deltaTimeAkumulasi+isNine) / 2;
      }else{
        tempDeltaTime = deltaTimeAkumulasi+isNine;
      }

      if(listDeltaTime.length > 0){
        let find = listDeltaTime.filter(dT => {
          if(dT[0] == tempDeltaTime){
            return dT;
          }
        });
        if(!find || find.length == 0) listDeltaTime.push([tempDeltaTime, 1]);
        else listDeltaTime[listDeltaTime.indexOf(find[0])] = [find[0][0], find[0][1]+1];
      }else{
        listDeltaTime.push([tempDeltaTime, 1]);
      }
    })
    let maxDt = 0, indexDeltaTime = -1;
    listDeltaTime.forEach(dT => {
      if(maxDt == 0 || maxDt < dT[1]) {
        maxDt = dT[1];
        indexDeltaTime = listDeltaTime.indexOf(dT);
      }
    })
    deltaTime = listDeltaTime[indexDeltaTime][0];
    
    let jamJadwal = [];
    let lowTime = -1;
    let lastTime = -1;
    mk.forEach(matkul => {
      if(lowTime < 0 || convertTimetoInt(matkul, 0) < lowTime) lowTime = convertTimetoInt(matkul, 0);
      if(lastTime < 0 || convertTimetoInt(matkul, 1) > lastTime) lastTime = convertTimetoInt(matkul, 1);
    })
    let jam = lowTime;
    while(jam < lastTime){
      if(jamJadwal.length > 0){
        if(jam + deltaTime >= lastTime) jamJadwal[jamJadwal.length-1] = jamJadwal[jamJadwal.length-1] + "-" + ('0'+Math.floor(lastTime/60)).slice(-2)+":"+(('0'+lastTime % 60).slice(-2));
        else jamJadwal[jamJadwal.length-1] = jamJadwal[jamJadwal.length-1] + "-"+ ('0'+Math.floor(jam % 60 == 0 ? jam/60 - 1 : jam/60)).slice(-2)+":"+(('0'+(jam % 60 == 0 ? '59' : jam % 60 - 1)).slice(-2));
      }
      if(jam+deltaTime < lastTime) jamJadwal.push(('0'+Math.floor(jam/60)).slice(-2)+":"+(('0'+jam % 60).slice(-2)))
      jam+=deltaTime;
    }

    return jamJadwal;
  }

  const createJadwal = () => {
    const hari = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"];
    let mkArray = [...mk];
    let mkSpliced = [];

    do{
      let filterSimilar = spliceMkBySimilarKode(mkArray);
      mkArray = [...filterSimilar[0]];
      mkSpliced = [...mkSpliced, ...filterSimilar[1]];
    }while(getSimilarMkFromJadwal(mkArray));
    
    const days = getDaysFromJadwal(mkArray);
    const mkElminates = eliminateMk(days, mkArray, mkSpliced, hari);

    let fixJadwal = [];
    let tempSks = 0;
    let tempJadwal = [];
    mkElminates.fixJadwal.forEach(jadwal => {
      if(tempJadwal.length == 0){
        tempJadwal.push(jadwal);
        tempSks += Number.parseInt(jadwal.sks);
      }else{
        let found = false;
        tempJadwal.forEach(matkul => {
          if(jadwal.kode == matkul.kode) {
            found = true;
          }
        })
        if(!found) {
          tempJadwal.push(jadwal);
          tempSks += Number.parseInt(jadwal.sks);
        }
      }
    });

    let jamJadwal = createJamJadwal(mkElminates);
    fixJadwal = [...inputToTimeJadwal(mkElminates, jamJadwal, hari, false)];
    fixJadwal = [...fixJadwal, inputToTimeJadwal(mkElminates, jamJadwal, hari, true)];

    fixJadwal.forEach(jadwal => {
      if(Array.isArray(jadwal)){
        for (let i = 0; i < jamJadwal.length; i++) {
          if(!jadwal[i]) jadwal[i] = {};
        }
      }else if(!jadwal || jadwal == undefined){
        jadwal = {};
      }
    })
    for (let j = 0; j < jamJadwal.length; j++) {
      for (let i = 0; i < fixJadwal.length; i++) {
        if(Array.isArray(jamJadwal[j])) jamJadwal[j] = [...jamJadwal[j], fixJadwal[i][j]];
        else jamJadwal[j] = [jamJadwal[j], fixJadwal[i][j]];
      }
    }
    setSks(tempSks);
    setData([...jamJadwal]);
    document.getElementsByClassName("mainTable")[0].scrollIntoView();
  }

  return (
    <div className='tabel'>
      <div className="top">
        <button className='btn-gen' onClick={() => createJadwal()}>Generate Your Plan KRS</button>
      </div>
      <table className='mainTable' style={{borderSpacing: 0}}>
        <thead>
          <tr>
            <th colSpan={6}>Jadwal Rekomendasi</th>
          </tr>
          <tr>
            <th>Jam</th>
            <th>Senin</th>
            <th>Selasa</th>
            <th>Rabu</th>
            <th>Kamis</th>
            <th>Jumat</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map((jam, index) => (
                <tr key={index}>
                  {
                    jam.map((jadwal, idx) => (
                      <td key={idx}>{idx == 0? jadwal : (Array.isArray(jadwal)? (
                        <table className='secondTable'><tbody>
                        <tr>
                        {jadwal.map((arrayJadwal, i) => (
                            <td key={i}>{arrayJadwal.kode + " " + arrayJadwal.kelas}</td>
                        ))}
                        </tr>
                        </tbody></table>
                      ):(Object.keys(jadwal).length > 0? jadwal.kode + " " + jadwal.kelas : ""))}</td>
                    ))
                  }
                </tr>
            ))
          }
          <tr>
            <td></td>
            <td className='totalSks' colSpan={4}>Total KRS</td>
            <td className='sks'>{sks}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Table