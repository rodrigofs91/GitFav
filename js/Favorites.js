import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => {
        return entry.login.toLowerCase() === username.toLowerCase()
      })

      if (userExists) {
        throw new Error("Usuário já cadastrado")
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")
    this.noFavorites = this.root.querySelector(".no-favorite")

    this.update()
    this.onadd()
  }

  tbodyIsNull() {
    const tbodyNull = this.tbody.childNodes.length == 0

    if (tbodyNull) {
      this.noFavorites.classList.remove("hiden")
      this.tbody.classList.add("hiden")
    } else {
      this.noFavorites.classList.add("hiden")
      this.tbody.classList.remove("hiden")
    }
  }

  onadd() {
    const addButton = this.root.querySelector("header button")
    addButton.onclick = () => {
      const { value } = this.root.querySelector("header input")

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach((user) => {
      const row = this.createRow()

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`

      row.querySelector(".user img").alt = `Foto do perfil de ${user.name}`

      row.querySelector(".user .infos .name").textContent = `${user.name}`

      row.querySelector(".user .infos .username").textContent = `/${user.login}`

      row.querySelector(
        ".user .infos a"
      ).href = `https://github.com/${user.login}`

      row.querySelector(".repositories").textContent = `${user.public_repos}`

      row.querySelector(".followers").textContent = `${user.followers}`

      row.querySelector(".btn-action").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha?")
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })

    this.tbodyIsNull()
  }

  createRow() {
    const tr = document.createElement("tr")

    tr.innerHTML = `
      <td class="user">
        <img src="https://avatars.githubusercontent.com/u/93543050?v=4" alt="Foto do perfil de Rodrigo" />
        <div class="infos">
          <span class="name">Rodrigo Santos</span>
          <a href="https://github.com/rodrigofs91" target="_blank" rel="noopener noreferrer">
            <span class="username">/rodrigofs91</span>
          </a>
        </div>
      </td>
      <td class="repositories">999</td>
      <td class="followers">999</td>
      <td>
        <button class="btn-action">Remover</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove()
    })
  }
}
