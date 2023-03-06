import React, {useState, useEffect} from 'react'
import cookie from 'universal-cookie'

function Table() {
  const [mk, setMk] = useState([]);
  const [data, setData] = useState([]);
  const Cookies = new cookie();

  useEffect(() => {
    setMk(JSON.parse(atob(Cookies.get('data'))));
    // console.log(atob(Cookies.get('data')))
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
    })
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
      return similar.length > 1 ? true : false
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
          if(mataKuliah.kelas != matkul.kelas
            // (mataKuliah.hari != matkul.hari || mataKuliah.jam != matkul.jam)
            ){
            if(indexKey.length == 0) indexKey.push(jadwal.indexOf(mataKuliah))
              indexKey.push(jadwal.indexOf(matkul))
          }
        }
        if(tempIndex.length > 0){
          indexKey = [...indexKey, tempIndex]
        }
      }
    });
    return indexKey;
  }
  
  const getSimilarMkFromJadwal = (jadwal = []) => {
    let mkSimilar = [], similar = false;
    jadwal.forEach(matkul => {
      if(mkSimilar.length > 0) {
        const len = mkSimilar.length
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
      const tempMK = matkul
      // console.log(tempMK)
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
          mkSpliced = mkArray.splice(indexSpliced, 1)
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
    const cekCanAddToJadwal = (jadwal = [], mkSplice) => {
      let canAdd = true;
      const matkul = getMKperDaysFromJadwal(jadwal, mkSplice.hari);
      if(matkul.length > 0){
        for (let i = 0; i < matkul.length-1; i++) {
          if(
            (
              ((convertTimetoInt(mkSplice, 0) <= convertTimetoInt(matkul[i], 1)) &&
              (convertTimetoInt(mkSplice, 1) >= convertTimetoInt(matkul[i+1], 0))) 
              // ||
              // ((convertTimetoInt(mkSplice, 0) == convertTimetoInt(jadwal[i], 0)) &&
              // (convertTimetoInt(mkSplice, 1) == convertTimetoInt(jadwal[i], 1)))
            )          
            ){
              // console.log((convertTimetoInt(mkSplice, 0) + " "+ convertTimetoInt(matkul[i], 1)))
              // console.log((convertTimetoInt(mkSplice, 1) + " "+ convertTimetoInt(matkul[i+1], 0)))
            canAdd = false;
          }
        }  
      }
      return canAdd;      
    }
    console.log([...splice])
    let batas = 5;
    do{
      // console.log("splice")
    splice.forEach(mkSplice => {
      // console.log(cekCanAddToJadwal(jadwal, mkSplice))
      // console.log(mkSplice.kode)
      console.log(cekKodeInJadwal(jadwal, mkSplice) + " " + mkSplice.kode + " " + mkSplice.kelas+  " " + cekCanAddToJadwal(jadwal, mkSplice))
      // console.log(jadwal)
      if(cekKodeInJadwal(jadwal, mkSplice) && cekCanAddToJadwal(jadwal, mkSplice)){
        console.log("Ada")
        jadwal = [...jadwal, mkSplice]
        changeJadwal = true;
      }else{
        splice.splice(splice.indexOf(mkSplice), 1);
      }
    })
    batas--;
    }while(splice.length > 0 && batas > 0);

    // console.log("eliminate start")
    // console.log([...jadwal])
    // console.log([...splice])
    // console.log("eliminate stop")
    return [changeJadwal, [...jadwal], [...splice]]
  }

  const eliminateMk = (days = [], mkArray = [], mkSpliced = []) => {
    const deleteSimilarMk = (mkDay, jadwal = []) => {
      let splicedMatkul = [];
      for (let j = 0; j < jadwal.length; j++) {
        if(mkDay[0].kode == jadwal[j].kode && mkDay[0].kelas == jadwal[j].kelas
          && (mkDay[0].hari != jadwal[j].hari || mkDay[0].jam != jadwal[j].jam)){
            console.log("hapus")
            const mkSplice = jadwal.splice(j, 1);
            splicedMatkul.push(mkSplice[0]);
          }
        }
        return [splicedMatkul, [...jadwal]];
    }

    const hari = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"];
    let simJadwal = [];
    let resultCanAdd = false;
    let fixJadwal;
    let jadwalConvert = [];
    let loop = 5;
    do{
      fixJadwal = [];
      console.log("mkArray")
      console.log([...mkArray])

    days.forEach(day => {
      // console.log(day)
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
        // console.log(simJadwal);
        // console.log("matkul");
        // console.log([...matkul]);
        for (let i = 0; i < matkul.length; i++) {
          for (let j = i+1; j < matkul.length; j++) {
            if(simJadwal[hari.indexOf(day)]){
              if(Array.isArray(simJadwal[hari.indexOf(day)])){
                for (let k = 0; k < simJadwal.length; k++) {
                  if (matkul[i] != simJadwal[hari.indexOf(day)][k] &&
                  // ((convertTimetoInt(matkul[i], 0) == convertTimetoInt(simJadwal[hari.indexOf(day)][k], 0) &&
                  // convertTimetoInt(matkul[i], 1) == convertTimetoInt(simJadwal[hari.indexOf(day)][k], 1)) ||
                  // (convertTimetoInt(matkul[i], 0) < convertTimetoInt(simJadwal[hari.indexOf(day)][k], 0) &&
                  // convertTimetoInt(matkul[i], 1) <= convertTimetoInt(simJadwal[hari.indexOf(day)][k], 1)) ||
                  // (convertTimetoInt(matkul[i], 0) > convertTimetoInt(simJadwal[hari.indexOf(day)][k], 0) &&
                  // convertTimetoInt(matkul[i], 1) >= convertTimetoInt(simJadwal[hari.indexOf(day)][k], 1)) ||
                  // (convertTimetoInt(matkul[i], 0) <= convertTimetoInt(simJadwal[hari.indexOf(day)][k], 0) &&
                  // convertTimetoInt(matkul[i], 1) >= convertTimetoInt(simJadwal[hari.indexOf(day)][k], 1))) ){
                    (convertTimetoInt(matkul[i], 0) <= convertTimetoInt(simJadwal[hari.indexOf(day)][k], 0)) &&
                    (convertTimetoInt(matkul[i], 1) >= convertTimetoInt(simJadwal[hari.indexOf(day)][k], 1))){
                    const mkSplice = matkul.splice(i, 1);
                    mkSpliced = [...mkSpliced, ...mkSplice];
                  }
                }
              }else{
                if (matkul[i] != simJadwal[hari.indexOf(day)] &&
                  // ((convertTimetoInt(matkul[i], 0) == convertTimetoInt(simJadwal[hari.indexOf(day)], 0) &&
                  // convertTimetoInt(matkul[i], 1) == convertTimetoInt(simJadwal[hari.indexOf(day)], 1)) ||
                  // (convertTimetoInt(matkul[i], 0) < convertTimetoInt(simJadwal[hari.indexOf(day)], 0) &&
                  // convertTimetoInt(matkul[i], 1) <= convertTimetoInt(simJadwal[hari.indexOf(day)], 1)) ||
                  // (convertTimetoInt(matkul[i], 0) > convertTimetoInt(simJadwal[hari.indexOf(day)], 0) &&
                  // convertTimetoInt(matkul[i], 1) >= convertTimetoInt(simJadwal[hari.indexOf(day)], 1)) ||
                  // (convertTimetoInt(matkul[i], 0) <= convertTimetoInt(simJadwal[hari.indexOf(day)], 0) &&
                  // convertTimetoInt(matkul[i], 1) >= convertTimetoInt(simJadwal[hari.indexOf(day)], 1))) ){
                  ((convertTimetoInt(matkul[i], 0) <= convertTimetoInt(simJadwal[hari.indexOf(day)], 0)) &&
                  (convertTimetoInt(matkul[i], 1) >= convertTimetoInt(simJadwal[hari.indexOf(day)], 1)) )){
                  const mkSplice = matkul.splice(i, 1);
                  mkSpliced = [...mkSpliced, ...mkSplice];
                }
              }
            }else
            if (convertTimetoInt(matkul[j], 0) < convertTimetoInt(matkul[i], 1)) {
                const mkSplice = matkul.splice(Math.round(Math.random()*1) ? i : j, 1);
                mkSpliced = [...mkSpliced, mkSplice[0]];
                let delSimMK = deleteSimilarMk(mkSplice, [...mkArray]);
                if(Array.isArray(delSimMK[0]) && Array.isArray(delSimMK[1])){
                  mkSpliced = [...mkSpliced, ...delSimMK[0]];
                  mkArray = [...delSimMK[1]]
                }
            }
            else if (i != j && (convertTimetoInt(matkul[i], 0) == convertTimetoInt(matkul[j], 0) || 
              convertTimetoInt(matkul[i], 1) == convertTimetoInt(matkul[j], 1) )) {
              const mkSplice = matkul.splice(Math.round(Math.random()*1) ? i : j, 1);
              mkSpliced = [...mkSpliced, mkSplice[0]];
              let delSimMK = deleteSimilarMk(mkSplice, [...mkArray]);
              if(Array.isArray(delSimMK[0]) && Array.isArray(delSimMK[1])){
                mkSpliced = [...mkSpliced, ...delSimMK[0]];
                mkArray = [...delSimMK[1]]
              }
            }
          }
        }
        matkul.forEach(mkInMatkul => {
          for (let j = 0; j < mkArray.length; j++) {
            if(mkInMatkul.kode == mkArray[j].kode && mkInMatkul.kelas == mkArray[j].kelas
              && (mkInMatkul.hari != mkArray[j].hari || mkInMatkul.jam != mkArray[j].jam)){
              if(Array.isArray(simJadwal[hari.indexOf(mkArray[j].hari)])){
                simJadwal[hari.indexOf(mkArray[j].hari)] = [...simJadwal[hari.indexOf(mkArray[j].hari)], mkArray[j]];
              }else{
                simJadwal[hari.indexOf(mkArray[j].hari)] = [mkArray[j]];
              }
            }
          }
        })
        // console.log([...matkul]);
      }
      // fixJadwal[hari.indexOf(day)] = matkul
      // console.log(matkul)
      fixJadwal = [...fixJadwal, ...matkul]
    })
    resultCanAdd = addMKSpliceToJadwal([...fixJadwal], [...mkSpliced]);
    mkArray = [...resultCanAdd[1]];
    mkSpliced = [...resultCanAdd[2]];
    simJadwal = [];
    if(loop == 0){
      break;
    }
    loop--;
    console.log("===================loop=========================")
    }while(resultCanAdd[0]);
    return {
      fixJadwal: [...fixJadwal],
      mkArray: [...mkArray],
      // mkSpliced: [...mkSpliced],
    }
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
    console.log([...mkArray])
    const days = getDaysFromJadwal(mkArray);
    const mkElminates = eliminateMk(days, mkArray, mkSpliced);

    console.log("hasil")
    console.log(mkElminates.fixJadwal)
    console.log("=====================================")

    let deltaTime = 0;
    // console.log(((convertTimetoInt(mkElminates.fixJadwal[0], 1) - convertTimetoInt(mkElminates.fixJadwal[0], 0))+1) % 2 == 0)
    if(((convertTimetoInt(mkElminates.fixJadwal[0], 1) - convertTimetoInt(mkElminates.fixJadwal[0], 0))+1) % 2 == 0){
      deltaTime = ((convertTimetoInt(mkElminates.fixJadwal[0], 1) - convertTimetoInt(mkElminates.fixJadwal[0], 0))+1) / 2;
      let lowTime = -1;
      let middleTime = -1;
      mkElminates.fixJadwal.forEach(matkul => {
        // const time = matkul.jam.split("-")[0].split((matkul.jam.split("-")[0].indexOf(":")) > 0 ? ":" : "." )[0];
        if(lowTime < 0 || convertTimetoInt(matkul, 0) < lowTime) lowTime = convertTimetoInt(matkul, 0);
      });
      mkElminates.fixJadwal.forEach(matkul => {
        console.log(matkul.jam+ " " + convertTimetoInt(matkul, 0)+ " " + (convertTimetoInt(matkul, 0) - lowTime ))
        console.log(convertTimetoInt(matkul, 0) - lowTime / deltaTime)
        // if(matkul.hari != "Jum'at" && !Number.isInteger(convertTimetoInt(matkul, 0) - lowTime / deltaTime)){
        //   if((convertTimetoInt(matkul, 0) - lowTime / deltaTime) < middleTime || middleTime < 0) middleTime = convertTimetoInt(matkul, 0)
        // }
      });
      console.log(lowTime/60 + " " + lowTime%60);
      console.log(Math.floor(middleTime/60) + " " + middleTime%60);
      // console.log(lowTime/60 + lowTime%60);

      // let jam = [];
      // hari.forEach(day => {
      //   const mkByDay = getMKperDaysFromJadwal(mkElminates.fixJadwal, day);
      //   for (let i = 0; i < mkByDay.length; i++) {
      //     let jamAwal = mkByDay[i].jam.split("-")[0];
      //     let jamAkhir = mkByDay[i].jam.split("-")[1];
      //     console.log(jamAwal + " " + jamAkhir)
      //     // if(((convertTimetoInt(mkByDay[i], 1) - convertTimetoInt(mkByDay[i], 0))+1) % deltaTime == 0){
      //       jamAwal = (convertTimetoInt(mkByDay[i], 0) - lowTime)/deltaTime ;
      //       jamAkhir = (convertTimetoInt(mkByDay[i], 1) - lowTime);
      //       if(mkByDay[i].jam.indexOf("9") >= 0) jamAkhir = (jamAkhir + 1)/deltaTime ;
      //       else jamAkhir /= deltaTime;
      //     // }
      //     // console.log(mkByDay[i].jam.indexOf("9"))
      //     console.log(jamAwal + " " + jamAkhir)
      //     console.log("jamAwal + jamAkhir")
      //     jam.push(mkByDay[i].jam)
      //   }
      // })
      // console.log(jam)
    }
    // console.log(mkArray)
    // console.log(mkElminates.mkSpliced)
  }

  return (
    <div className='tabel'>
      <table border={1} style={{borderSpacing: 0}}>
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
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      {data && (<p>{data}</p>)}
      <button onClick={() => createJadwal()}>get data</button>
    </div>
  )
}

export default Table