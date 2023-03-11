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
            )          
            ){
            canAdd = false;
          }
        }  
      }
      return canAdd;      
    }
    // console.log([...splice])
    let batas = 5;
    do{
    splice.forEach(mkSplice => {
      // console.log(cekKodeInJadwal(jadwal, mkSplice) + " " + mkSplice.kode + " " + mkSplice.kelas+  " " + cekCanAddToJadwal(jadwal, mkSplice))
      if(cekKodeInJadwal(jadwal, mkSplice) && cekCanAddToJadwal(jadwal, mkSplice)){
        // console.log("Ada")
        jadwal = [...jadwal, mkSplice]
        changeJadwal = true;
      }else{
        splice.splice(splice.indexOf(mkSplice), 1);
      }
    })
    batas--;
    }while(splice.length > 0 && batas > 0);
    return [changeJadwal, [...jadwal], [...splice]]
  }

  const eliminateMk = (days = [], mkArray = [], mkSpliced = [], hari = []) => {
    const deleteSimilarMk = (mkDay, jadwal = []) => {
      let splicedMatkul = [];
      for (let j = 0; j < jadwal.length; j++) {
        if(mkDay[0].kode == jadwal[j].kode && mkDay[0].kelas == jadwal[j].kelas
          && (mkDay[0].hari != jadwal[j].hari || mkDay[0].jam != jadwal[j].jam)){
            const mkSplice = jadwal.splice(j, 1);
            splicedMatkul.push(mkSplice[0]);
          }
        }
        return [splicedMatkul, [...jadwal]];
    }

    let simJadwal = [];
    let resultCanAdd = false;
    let fixJadwal;
    let loop = 5;
    do{
      fixJadwal = [];
      console.log("mkArray")
      console.log([...mkArray])

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

  const inputToTimeJadwal = (mkElminates = [], jamJadwal = [], hari = [], isJumat = false) => {
    let fixJadwal = [];
    mkElminates.fixJadwal.forEach(matkul => {
      let start = false, end = false;
      if(isJumat ? matkul.hari == "Jum'at" : matkul.hari != "Jum'at")
      jamJadwal.forEach(time => {
        if(convertTimetoInt(matkul, 0) == convertTimetoInt({jam: time}, 0)){
          if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
            fixJadwal[hari.indexOf(matkul.hari)] = [];
          }
          start = true
          fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = matkul
        }else if(convertTimetoInt(matkul, 1) == convertTimetoInt({jam: time}, 1)){
          if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
            fixJadwal[hari.indexOf(matkul.hari)] = []
          }
          end = true
          fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = matkul
        }else if(
          (convertTimetoInt(matkul, 0) < convertTimetoInt({jam: time}, 0)) &&
          (convertTimetoInt(matkul, 1) > convertTimetoInt({jam: time}, 1))
          ){
            if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
              fixJadwal[hari.indexOf(matkul.hari)] = []
            }
            fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = matkul
        }
      })
      // if(isJumat)
      // {console.log("jamJadwal")
      // console.log([...fixJadwal])}
      if(isJumat ? matkul.hari == "Jum'at" : matkul.hari != "Jum'at")
      if(!start) {
        // console.log("jam awal " +matkul.jam + " " + matkul.hari)
        jamJadwal.forEach(time => {
          if((convertTimetoInt(matkul, 0) > convertTimetoInt({jam: time}, 0)) &&
          (convertTimetoInt(matkul, 0) < convertTimetoInt({jam: time}, 1))){
            if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
              fixJadwal[hari.indexOf(matkul.hari)] = []
            }
            if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)])){
              fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = []
            }
            fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = 
            [...fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)], matkul]
          }
        })
      } 
      if(!end){
        // console.log("jam akhir " +matkul.jam + " " + matkul.hari)
        jamJadwal.forEach(time => {
          if((convertTimetoInt(matkul, 1) > convertTimetoInt({jam: time}, 0)) &&
          (convertTimetoInt(matkul, 1) < convertTimetoInt({jam: time}, 1))){
            if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)])){
              fixJadwal[hari.indexOf(matkul.hari)] = []
            }
            if(!Array.isArray(fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)])){
              fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = []
            }
            fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)] = 
            [...fixJadwal[hari.indexOf(matkul.hari)][jamJadwal.indexOf(time)], matkul]
          }
        })
      }
    })
    if(!isJumat && fixJadwal.length > 4) fixJadwal.pop();
    if(!isJumat && fixJadwal.length < 5){
      fixJadwal.forEach(jadwal => {
        if(!jadwal) jadwal = {}
      })
    }
    return (isJumat? (fixJadwal[4] ? fixJadwal[4] : [{}]) : fixJadwal);
  }

  const createJamJadwal = (mkElminates = [], isJumat = false) => {
    let listDeltaTime = [], deltaTime = 0;
    mkElminates.fixJadwal.forEach(matkul => {
      // if(isJumat? matkul.hari == "Jum'at" : matkul.hari != "Jum'at"){
        const deltaTimeAkumulasi = (convertTimetoInt(matkul, 1) - convertTimetoInt(matkul, 0))
        const isNine = (deltaTimeAkumulasi.toString().substring(0, deltaTimeAkumulasi.toString().length).indexOf("9") > 0) ? 1 : 0
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
          else listDeltaTime[listDeltaTime.indexOf(find[0])] = [find[0][0], find[0][1]+1]
        }else{
          listDeltaTime.push([tempDeltaTime, 1])
        }
      // }
    })
    // console.log(listDeltaTime)
    let maxDt = 0, indexDeltaTime = -1;
    listDeltaTime.forEach(dT => {
      if(maxDt == 0 || maxDt < dT[1]) {
        maxDt = dT[1]
        indexDeltaTime = listDeltaTime.indexOf(dT)
      }
    })
    deltaTime = listDeltaTime[indexDeltaTime][0]
    
    let jamJadwal = [];
    let lowTime = -1;
    // let middleTime = -1;
    let lastTime = -1;
    mk.forEach(matkul => {
      // if(isJumat? matkul.hari == "Jum'at" : matkul.hari != "Jum'at"){
        if(lowTime < 0 || convertTimetoInt(matkul, 0) < lowTime) lowTime = convertTimetoInt(matkul, 0);
        if(lastTime < 0 || convertTimetoInt(matkul, 1) > lastTime) lastTime = convertTimetoInt(matkul, 1);
      // }
    })
    // let deltaTimeMiddle = -1;
    // mk.forEach(matkul => {
    //   if((isJumat? matkul.hari == "Jum'at" : matkul.hari != "Jum'at") && !Number.isInteger((convertTimetoInt(matkul, 0) - lowTime) / deltaTime)){
    //     if((convertTimetoInt(matkul, 0) - lowTime / deltaTime) < middleTime || middleTime < 0) middleTime = convertTimetoInt(matkul, 0)
    //     if(deltaTimeMiddle < 0) {
    //       deltaTimeMiddle = convertTimetoInt(matkul, 1) - convertTimetoInt(matkul, 0);
    //       if(deltaTimeMiddle.toString().indexOf("9")) {
    //         deltaTimeMiddle += 1;
    //       }
    //       if(deltaTimeMiddle % 2 == 0) {
    //         deltaTimeMiddle /= 2;
    //       }else if(deltaTimeMiddle % 3 == 0){
    //         deltaTimeMiddle /= 3;
    //       }
    //     }else{
    //       let timeAkumulasiMiddle = convertTimetoInt(matkul, 1) - convertTimetoInt(matkul, 0);
    //       if(((timeAkumulasiMiddle.toString().indexOf("9") > 0 ? timeAkumulasiMiddle+1 : timeAkumulasiMiddle) % 3 == 0) && (deltaTimeMiddle * 2 == timeAkumulasiMiddle)){
    //         deltaTimeMiddle = (deltaTimeMiddle == timeAkumulasiMiddle/3 ? 0 : timeAkumulasiMiddle/3)
    //       }
    //     }
    //   }
    // });
    let jam = lowTime;
    while(jam < lastTime){
      if(jamJadwal.length > 0){
        jamJadwal[jamJadwal.length-1] = jamJadwal[jamJadwal.length-1] + "-"+ ('0'+Math.floor(jam % 60 == 0 ? jam/60 - 1 : jam/60)).slice(-2)+":"+(('0'+(jam % 60 == 0 ? '59' : jam % 60 - 1)).slice(-2))
      }
      if(jam+deltaTime < lastTime) jamJadwal.push(('0'+Math.floor(jam/60)).slice(-2)+":"+(('0'+jam % 60).slice(-2)))
      jam+=deltaTime
    }
    // jam = middleTime
    // let bts = 0;
    // while(jam < lastTime){
    //   if(bts > 0){
    //     if(jam+deltaTimeMiddle >= lastTime) jamJadwal[jamJadwal.length-1] = jamJadwal[jamJadwal.length-1] + "-" + ('0'+Math.floor(lastTime/60)).slice(-2)+":"+(('0'+lastTime % 60).slice(-2))
    //     else jamJadwal[jamJadwal.length-1] = jamJadwal[jamJadwal.length-1] + "-" + ('0'+Math.floor(jam % 60 == 0 ? jam/60 - 1 : jam/60)).slice(-2)+":"+(('0'+(jam % 60 == 0 ? '59' : jam % 60 - 1)).slice(-2))
    //   }
    //   if(jam+deltaTimeMiddle < lastTime) jamJadwal.push(('0'+Math.floor(jam/60)).slice(-2)+":"+(('0'+jam % 60).slice(-2)))
    //   jam+=deltaTimeMiddle
    //   bts++;
    // }

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
    console.log([...mkArray])
    const days = getDaysFromJadwal(mkArray);
    const mkElminates = eliminateMk(days, mkArray, mkSpliced, hari);

    console.log("hasil")
    console.log(mkElminates.fixJadwal)
    console.log("=====================================")
    
    let fixJadwal = [];

    let jamJadwal = createJamJadwal(mkElminates)
    console.log(jamJadwal)
    fixJadwal = [...inputToTimeJadwal(mkElminates, jamJadwal, hari, false)]
    fixJadwal = [...fixJadwal, inputToTimeJadwal(mkElminates, jamJadwal, hari, true)]

    fixJadwal.forEach(jadwal => {
      if(Array.isArray(jadwal)){
        for (let i = 0; i < jamJadwal.length; i++) {
          if(!jadwal[i]) jadwal[i] = {}
        }
      }
    })
    console.log(fixJadwal)
    // setData([...fixJadwal])
      
    // console.log(fixJadwal)
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
        </tbody>
      </table>
      <button onClick={() => createJadwal()}>get data</button>
    </div>
  )
}

export default Table